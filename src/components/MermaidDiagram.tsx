'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// At module level, before component definition:
let mermaidInitialized = false;
function ensureMermaidInit() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#f8fafc',
      primaryBorderColor: '#60a5fa',
      lineColor: '#94a3b8',
      secondaryColor: '#1e293b',
      tertiaryColor: '#0f172a',
      background: '#0f172a',
      mainBkg: '#1e293b',
      nodeBorder: '#60a5fa',
      clusterBkg: '#1e293b',
      clusterBorder: '#60a5fa',
      titleColor: '#f8fafc',
      edgeLabelBackground: '#1e293b',
    },
  });
  mermaidInitialized = true;
}

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureMermaidInit();

    const renderDiagram = async () => {
      if (containerRef.current && chart) {
        let chartToRender = chart.trim();
        try {
          // Generate a unique ID for the diagram
          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;

          // Auto-wrap simple flow arrows in Mermaid syntax if not already present
          const mermaidKeywords = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'pie', 'gantt', 'mindmap'];
          const hasMermaidSyntax = mermaidKeywords.some(keyword => chartToRender.toLowerCase().startsWith(keyword.toLowerCase()));

          if (!hasMermaidSyntax && chartToRender.includes('→')) {
            // Convert simple flow arrows to Mermaid graph LR syntax
            const nodes = chartToRender.split('→').map(n => n.trim());
            const nodeIds = nodes.map((_, i) => `N${i}`);
            let mermaidChart = 'graph LR\n';
            nodes.forEach((node, i) => {
              mermaidChart += `    ${nodeIds[i]}["${node}"]\n`;
              if (i < nodes.length - 1) {
                mermaidChart += `    ${nodeIds[i]} --> ${nodeIds[i + 1]}\n`;
              }
            });
            chartToRender = mermaidChart;
          }

          const { svg } = await mermaid.render(id, chartToRender);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Failed to render Mermaid diagram:', error);
          const originalChart = chart.trim();
          if (originalChart.includes('→')) {
            const nodes = originalChart.split(/→|→/).map(n => n.trim()).filter(Boolean);
            containerRef.current.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.className = 'flex flex-wrap items-center gap-2 justify-center p-4';
            nodes.forEach((node, i) => {
              const pill = document.createElement('span');
              pill.className = 'px-3 py-1.5 border border-primary/40 bg-card font-mono text-xs rounded-sm text-foreground';
              pill.textContent = node;
              wrapper.appendChild(pill);
              if (i < nodes.length - 1) {
                const arrow = document.createElement('span');
                arrow.className = 'text-primary text-sm';
                arrow.textContent = '→';
                wrapper.appendChild(arrow);
              }
            });
            containerRef.current.appendChild(wrapper);
          } else if (containerRef.current) {
            containerRef.current.innerHTML = `<p class="text-sm text-muted-foreground whitespace-pre-wrap font-mono">${chart}</p>`;
          }
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div 
      ref={containerRef} 
      className={`flex items-center justify-center overflow-auto ${className}`}
    />
  );
}
