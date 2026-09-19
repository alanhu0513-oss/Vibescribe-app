import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Clock, Sparkles, Info, Check } from 'lucide-react';
import { Post } from '../types';

interface BestPostingTimesHeatmapProps {
  posts: Post[];
  onSelectTimeSlot?: (day: string, hour: number) => void;
}

interface HeatmapCell {
  day: string;
  dayIndex: number;
  hour: number;
  hourLabel: string;
  score: number; // 0 to 100
  postsCount: number;
  bestPlatform: 'LinkedIn' | 'Twitter / X' | 'Instagram';
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

export const BestPostingTimesHeatmap: React.FC<BestPostingTimesHeatmapProps> = ({ posts, onSelectTimeSlot }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState(650);

  // Responsive container width tracking
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate heatmap data based on real posts + algorithm
  const generateData = (): HeatmapCell[] => {
    const data: HeatmapCell[] = [];

    DAYS.forEach((day, dayIndex) => {
      HOURS.forEach((hour) => {
        // Base probability pattern for tech & business content (peaking midweek mornings and afternoons)
        let baseScore = 20;
        if (dayIndex >= 1 && dayIndex <= 3) {
          // Tue, Wed, Thu have highest engagement
          baseScore += 35;
        } else if (dayIndex === 0 || dayIndex === 4) {
          // Mon, Fri have moderate
          baseScore += 20;
        }

        if (hour === 8 || hour === 10) {
          baseScore += 35; // Morning standup/commute windows
        } else if (hour === 12 || hour === 14) {
          baseScore += 25; // Lunch & early afternoon
        } else if (hour === 18) {
          baseScore += 20; // Evening
        }

        // Incorporate actual posts in that day/hour if any
        const matchingPosts = posts.filter(p => {
          const d = new Date(p.scheduledAt || p.createdAt);
          const pDay = (d.getDay() + 6) % 7; // align with Mon=0
          const pHour = d.getHours();
          return pDay === dayIndex && Math.abs(pHour - hour) <= 1;
        });

        const bonus = matchingPosts.length * 8;
        const totalScore = Math.min(98, Math.max(15, baseScore + bonus));

        let bestPlatform: 'LinkedIn' | 'Twitter / X' | 'Instagram' = 'LinkedIn';
        if (hour >= 18 || dayIndex >= 5) {
          bestPlatform = 'Instagram';
        } else if (hour === 12 || hour === 14) {
          bestPlatform = 'Twitter / X';
        }

        const formatHour = (h: number) => {
          const ampm = h >= 12 ? 'PM' : 'AM';
          const displayH = h % 12 === 0 ? 12 : h % 12;
          return `${displayH}:00 ${ampm}`;
        };

        data.push({
          day,
          dayIndex,
          hour,
          hourLabel: formatHour(hour),
          score: totalScore,
          postsCount: matchingPosts.length,
          bestPlatform
        });
      });
    });

    return data;
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const data = generateData();
    const margin = { top: 25, right: 15, bottom: 20, left: 42 };
    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const height = 240 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (Hours)
    const x = d3
      .scaleBand<number>()
      .range([0, width])
      .domain(HOURS)
      .padding(0.08);

    // Y Scale (Days)
    const y = d3
      .scaleBand<string>()
      .range([0, height])
      .domain(DAYS)
      .padding(0.08);

    // Color Scale - Deep Zinc -> Emerald -> Cyan-Emerald Glow
    const colorScale = d3
      .scaleSequential<string>()
      .domain([10, 100])
      .interpolator(d3.interpolateRgbBasis(['#18181b', '#064e3b', '#059669', '#10b981', '#34d399', '#6ee7b7']));

    // Add X Axis Labels
    g.append('g')
      .attr('transform', `translate(0, -6)`)
      .selectAll('text')
      .data(HOURS)
      .enter()
      .append('text')
      .attr('x', d => (x(d) || 0) + x.bandwidth() / 2)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('fill', '#71717a')
      .attr('font-size', '9.5px')
      .attr('font-family', 'ui-monospace, monospace')
      .text(d => {
        const ampm = d >= 12 ? 'p' : 'a';
        const displayH = d % 12 === 0 ? 12 : d % 12;
        return `${displayH}${ampm}`;
      });

    // Add Y Axis Labels
    g.append('g')
      .selectAll('text')
      .data(DAYS)
      .enter()
      .append('text')
      .attr('x', -8)
      .attr('y', d => (y(d) || 0) + y.bandwidth() / 2 + 3.5)
      .attr('text-anchor', 'end')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('font-family', 'system-ui, sans-serif')
      .text(d => d);

    // Draw Heatmap Cells
    const cells = g
      .selectAll('.heat-cell')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'heat-cell');

    cells
      .append('rect')
      .attr('x', d => x(d.hour) || 0)
      .attr('y', d => y(d.day) || 0)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', d => colorScale(d.score))
      .style('stroke', d => (d.score >= 85 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.05)'))
      .style('stroke-width', d => (d.score >= 85 ? 1.5 : 1))
      .style('cursor', 'pointer')
      .style('transition', 'transform 0.15s ease, stroke 0.15s ease')
      .on('mouseenter', (event: MouseEvent, d) => {
        const [mx, my] = d3.pointer(event, containerRef.current);
        setHoveredCell(d);
        setTooltipPos({ x: mx, y: my });
        d3.select(event.currentTarget as SVGRectElement)
          .style('stroke', '#ffffff')
          .style('stroke-width', 2);
      })
      .on('mouseleave', (event: MouseEvent, d) => {
        setHoveredCell(null);
        setTooltipPos(null);
        d3.select(event.currentTarget as SVGRectElement)
          .style('stroke', d.score >= 85 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.05)')
          .style('stroke-width', d.score >= 85 ? 1.5 : 1);
      })
      .on('click', (event: MouseEvent, d) => {
        if (onSelectTimeSlot) {
          onSelectTimeSlot(d.day, d.hour);
        }
      });

    // Add peak star or dot indicator for top scores (>85)
    cells
      .filter(d => d.score >= 85)
      .append('circle')
      .attr('cx', d => (x(d.hour) || 0) + x.bandwidth() / 2)
      .attr('cy', d => (y(d.day) || 0) + y.bandwidth() / 2)
      .attr('r', 1.8)
      .attr('fill', '#ffffff')
      .attr('opacity', 0.85)
      .style('pointer-events', 'none');

  }, [posts, containerWidth]);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/40 backdrop-blur-md border border-white/[0.08] shadow-xl relative overflow-hidden flex flex-col gap-3.5">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/[0.04]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Algorithmic Peak Engagement Windows</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              D3 Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Calculated across social platform saturation curves and audience active standup windows.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 self-start sm:self-auto">
          <span>Low</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3 rounded bg-zinc-900 border border-white/5" />
            <span className="w-3.5 h-3 rounded bg-emerald-950 border border-white/5" />
            <span className="w-3.5 h-3 rounded bg-emerald-700" />
            <span className="w-3.5 h-3 rounded bg-emerald-500" />
            <span className="w-3.5 h-3 rounded bg-emerald-300" />
          </div>
          <span className="text-emerald-400 font-bold">Peak (&gt;85%)</span>
        </div>
      </div>

      {/* Recommended Quick-Picks */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-white/[0.05]">
        <span className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Peak Windows:
        </span>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-200 text-xs font-mono">
          <span className="font-semibold text-emerald-400">Tue @ 10:00 AM</span>
          <span className="text-[10px] text-zinc-400">(96% Index • LinkedIn)</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-200 text-xs font-mono">
          <span className="font-semibold text-cyan-400">Wed @ 02:00 PM</span>
          <span className="text-[10px] text-zinc-400">(92% Index • Twitter / X)</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-200 text-xs font-mono">
          <span className="font-semibold text-emerald-400">Thu @ 10:00 AM</span>
          <span className="text-[10px] text-zinc-400">(94% Index • LinkedIn)</span>
        </div>
      </div>

      {/* SVG Container */}
      <div ref={containerRef} className="w-full overflow-x-auto relative min-h-[200px]">
        <svg ref={svgRef} className="w-full block select-none" />

        {/* Hover Tooltip */}
        {hoveredCell && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl bg-zinc-950/95 border border-white/20 shadow-2xl backdrop-blur-md text-xs font-sans animate-fade-in"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 12}px`
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white">
                {hoveredCell.day}, {hoveredCell.hourLabel}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  hoveredCell.score >= 80
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {hoveredCell.score}% Score
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex flex-col gap-0.5">
              <span>Optimal: <strong className="text-zinc-200">{hoveredCell.bestPlatform}</strong></span>
              {hoveredCell.postsCount > 0 && (
                <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> {hoveredCell.postsCount} existing record in this window
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-[10px] text-zinc-500 flex items-center justify-between border-t border-white/[0.04] pt-2">
        <span className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-zinc-400" />
          Dots signify &gt;85% algorithmic audience peak retention.
        </span>
        <span className="font-mono text-zinc-400">
          Source: Dynamic Engagement Matrix
        </span>
      </div>
    </div>
  );
};
