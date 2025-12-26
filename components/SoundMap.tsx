import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { AcousticParams, ContourLevel } from '../types';

interface SoundMapProps {
  params: AcousticParams;
  resultLp: number;
  contours: ContourLevel[];
}

const SoundMap: React.FC<SoundMapProps> = ({ params, resultLp, contours }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup dimensions
  const dimensions = useMemo(() => ({ width: 600, height: 600 }), []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;
    const { distance } = params;

    // Determine scale domain
    // User requested "more zoomed in". 
    // We calculate the max radius needed to show relevant items (User position OR the furthest contour).
    const maxContourRadius = contours.length > 0 ? contours[contours.length - 1].radius : 0;
    
    // We take the larger of the user distance or the max contour, but apply a smaller padding factor (1.1x instead of 1.5-3x)
    // ensuring we are tight on the relevant data.
    const relevantMax = Math.max(distance, maxContourRadius);
    const domainMax = relevantMax * 1.2; 

    const scale = d3.scaleLinear()
      .domain([-domainMax, domainMax])
      .range([0, Math.min(width, height)]);

    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append("g")
      .attr("transform", `translate(${centerX - scale(0)}, ${centerY - scale(0)})`);

    // 1. Draw Regulatory Contours (Red Dotted Lines)
    contours.forEach((contour) => {
        const rPx = scale(contour.radius) - scale(0);
        
        // Circle path
        g.append("circle")
          .attr("cx", scale(0))
          .attr("cy", scale(0))
          .attr("r", rPx)
          .attr("fill", "none")
          .attr("stroke", "#ef4444") // Red-500
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "6,4") // Distinct dotted line
          .attr("opacity", 0.8);

        // Background for text to make it readable over grid lines or other elements
        // We place text on the top of the circle
        g.append("text")
          .attr("x", scale(0))
          .attr("y", scale(0) - rPx - 6)
          .attr("text-anchor", "middle")
          .attr("fill", "#dc2626") // Darker Red
          .attr("font-size", "11px")
          .attr("font-weight", "bold")
          .text(`${contour.label}`);
    });

    // 2. Draw Source (Center)
    g.append("circle")
      .attr("cx", scale(0))
      .attr("cy", scale(0))
      .attr("r", 8)
      .attr("fill", "#ef4444") 
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    g.append("text")
      .attr("x", scale(0))
      .attr("y", scale(0) + 20)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("fill", "#ef4444")
      .attr("font-size", "12px")
      .text("Bron");

    // 3. Draw User Position (Distance r)
    // We place it on the right side (positive X axis)
    
    // Line from source to user
    g.append("line")
      .attr("x1", scale(0))
      .attr("y1", scale(0))
      .attr("x2", scale(distance))
      .attr("y2", scale(0))
      .attr("stroke", "#3b82f6") // Blue-500
      .attr("stroke-width", 2)
      .attr("opacity", 0.3);

    // The Point
    g.append("circle")
      .attr("cx", scale(distance))
      .attr("cy", scale(0))
      .attr("r", 6)
      .attr("fill", "#3b82f6")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Label for User Point
    g.append("rect")
      .attr("x", scale(distance) + 10)
      .attr("y", scale(0) - 15)
      .attr("width", 60)
      .attr("height", 30)
      .attr("rx", 4)
      .attr("fill", "rgba(255, 255, 255, 0.9)")
      .attr("stroke", "#cbd5e1");

    g.append("text")
      .attr("x", scale(distance) + 40)
      .attr("y", scale(0) - 4)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("fill", "#1e293b")
      .attr("font-size", "12px")
      .text(`${resultLp} dB`);

    g.append("text")
      .attr("x", scale(distance) + 40)
      .attr("y", scale(0) + 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", "10px")
      .text(`${distance}m`);
    
  }, [params, resultLp, contours, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center overflow-hidden bg-slate-50 rounded-xl border border-slate-200 shadow-inner relative">
       <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      />
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-xs text-slate-600 border border-slate-200 shadow-sm pointer-events-none flex flex-col gap-1">
        <div className="font-semibold mb-1">Legende</div>
        <div className="flex items-center gap-2">
           <div className="w-4 h-0.5 bg-red-500 border-t-2 border-dotted border-red-500"></div>
           <span>Wettelijke grens (Vlaanderen)</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-4 h-4 rounded-full bg-blue-500 border border-white"></div>
           <span>Gekozen afstand</span>
        </div>
      </div>
    </div>
  );
};

export default SoundMap;