"use server";

interface GitHubStats {
  totalCommits: number;
  contributionsLastYear: number;
  publicRepos: number;
  topLanguages: string[];
}

export async function getGitHubStats(): Promise<GitHubStats> {
  const username = process.env.GITHUB_USERNAME || "patsarun2545";
  const token = process.env.GITHUB_TOKEN;
  
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    // Fetch user profile
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!userResponse.ok) {
      throw new Error("Failed to fetch GitHub user data");
    }
    
    const userData = await userResponse.json();
    
    // Fetch user's repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&type=owner`,
      {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );
    
    if (!reposResponse.ok) {
      throw new Error("Failed to fetch GitHub repositories");
    }
    
    const reposData = await reposResponse.json();
    
    // Calculate total commits by fetching each repo's commits
    let totalCommits = 0;
    const languageMap: Record<string, number> = {};
    
    // Process repos in batches to avoid rate limits
    for (const repo of reposData.slice(0, 30)) {
      // Count languages
      if (repo.language) {
        languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
      }
      
      // Fetch commit count (using stats endpoint is faster)
      try {
        const statsResponse = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/stats/contributors`,
          {
            headers,
            next: { revalidate: 3600 },
          }
        );
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (Array.isArray(statsData)) {
            const userStats = statsData.find((s: { author: { login: string }; total: number }) => s.author.login === username);
            if (userStats) {
              totalCommits += userStats.total;
            }
          }
        }
      } catch {
        // Skip if stats endpoint fails
        continue;
      }
    }
    
    // Get top 3 languages
    const topLanguages = Object.entries(languageMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([lang]) => lang);
    
    // Fetch contributions using GraphQL API for accurate data
    let contributionsLastYear = 0;
    try {
      const graphqlQuery = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
      `;
      
      const graphqlResponse = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { username },
        }),
        next: { revalidate: 3600 },
      });
      
      if (graphqlResponse.ok) {
        const graphqlData = await graphqlResponse.json();
        if (graphqlData.data?.user?.contributionsCollection?.contributionCalendar) {
          contributionsLastYear = graphqlData.data.user.contributionsCollection.contributionCalendar.totalContributions;
        }
      }
    } catch {
      // Fallback to estimation if GraphQL fails
      contributionsLastYear = Math.floor(totalCommits * 0.6);
    }
    
    return {
      totalCommits,
      contributionsLastYear,
      publicRepos: userData.public_repos || 0,
      topLanguages,
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    // Return default values on error
    return {
      totalCommits: 0,
      contributionsLastYear: 0,
      publicRepos: 0,
      topLanguages: [],
    };
  }
}
