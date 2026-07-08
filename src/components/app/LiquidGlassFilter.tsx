'use client';

import React from 'react';

export default function LiquidGlassFilter() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -9999,
      }}
      aria-hidden="true"
    >
      <defs>
        {/* ── Dark Mode Liquid Glass Material ── */}
        <filter id="liquid-glass-dark" x="-30%" y="-30%" width="160%" height="160%">
          {/* 1. Frosted glass blur of background */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blurred" />

          {/* 2. Slow shimmering turbulence map (stable 50s cycle) */}
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" result="noise">
            <animate attributeName="baseFrequency" values="0.012;0.014;0.012" dur="50s" repeatCount="indefinite" />
          </feTurbulence>

          {/* 3. Smooth noise for refraction & specular bump map */}
          <feGaussianBlur in="noise" stdDeviation="2.5" result="smoothNoise" />

          {/* 4. Center-to-Edge Mask to make center readable and edges refractive */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="25" result="blurredAlpha" />
          <feComponentTransfer in="blurredAlpha" result="invertedAlpha">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feComposite in="smoothNoise" in2="invertedAlpha" operator="in" result="maskedNoise" />

          {/* 5. Chromatic Displacement (refraction) - stronger on the edges using maskedNoise */}
          <feDisplacementMap in="blurred" in2="maskedNoise" scale="30" xChannelSelector="R" yChannelSelector="G" result="redDisplace" />
          <feDisplacementMap in="blurred" in2="maskedNoise" scale="42" xChannelSelector="G" yChannelSelector="B" result="greenBlueDisplace" />

          {/* 6. Extract Channels for Chromatic Separation */}
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0"
            in="redDisplace"
            result="redChannel"
          />

          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 1 0"
            in="greenBlueDisplace"
            result="greenBlueChannels"
          />

          {/* 7. Recombine channels to create subtle chromatic refraction */}
          <feComposite in="redChannel" in2="greenBlueChannels" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="chromaticBg" />

          {/* 8. Apply Saturation (2.2) and Brightness (1.08) directly inside SVG */}
          <feColorMatrix type="saturate" values="2.2" in="chromaticBg" result="saturated" />
          <feColorMatrix
            type="matrix"
            values="
              1.08 0 0 0 0
              0 1.08 0 0 0
              0 0 1.08 0 0
              0 0 0 1 0"
            in="saturated"
            result="gradedBg"
          />

          {/* 9. Specular light / Caustics with animated light position */}
          <feSpecularLighting in="smoothNoise" specularExponent="22" specularConstant="1.8" surfaceScale="3" lightingColor="#ffffff" result="specularLight">
            <feDistantLight azimuth="225" elevation="50">
              <animate attributeName="azimuth" values="225;255;225" dur="45s" repeatCount="indefinite" />
              <animate attributeName="elevation" values="50;62;50" dur="35s" repeatCount="indefinite" />
            </feDistantLight>
          </feSpecularLighting>
          <feBlend mode="overlay" in="specularLight" in2="gradedBg" result="causticsBg" />

          {/* 10. Light scattering (frosted crystal texture feel) */}
          <feFlood floodColor="#ffffff" floodOpacity={0.04} result="scattered" />
          <feBlend mode="screen" in="scattered" in2="causticsBg" result="scatteredBg" />

          {/* 11. Multi-layered Fresnel edge highlights */}
          {/* Highlight 1: Outer crisp reflection */}
          <feMorphology operator="erode" radius="1" in="SourceAlpha" result="eroded1" />
          <feComposite operator="out" in="SourceAlpha" in2="eroded1" result="edgeMask1" />
          <feFlood floodColor="#ffffff" floodOpacity={0.7} result="floodWhite1" />
          <feComposite operator="in" in="floodWhite1" in2="edgeMask1" result="edgeHighlight1" />

          {/* Highlight 2: Inner soft reflection */}
          <feMorphology operator="erode" radius="3.5" in="SourceAlpha" result="eroded2" />
          <feComposite operator="out" in="SourceAlpha" in2="eroded2" result="edgeMask2" />
          <feFlood floodColor="#ffffff" floodOpacity={0.35} result="floodWhite2" />
          <feComposite operator="in" in="floodWhite2" in2="edgeMask2" result="edgeHighlight2" />
          <feGaussianBlur in="edgeHighlight2" stdDeviation="1.5" result="blurredEdgeHighlight2" />

          {/* 12. Final Assembly */}
          <feMerge>
            <feMergeNode in="scatteredBg" />
            <feMergeNode in="edgeHighlight1" />
            <feMergeNode in="blurredEdgeHighlight2" />
          </feMerge>
        </filter>

        {/* ── Light Mode Liquid Glass Material ── */}
        <filter id="liquid-glass-light" x="-30%" y="-30%" width="160%" height="160%">
          {/* 1. Frosted glass blur of background */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blurred" />

          {/* 2. Slow shimmering turbulence map (stable 50s cycle) */}
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" result="noise">
            <animate attributeName="baseFrequency" values="0.012;0.014;0.012" dur="50s" repeatCount="indefinite" />
          </feTurbulence>

          {/* 3. Smooth noise for refraction & specular bump map */}
          <feGaussianBlur in="noise" stdDeviation="2.5" result="smoothNoise" />

          {/* 4. Center-to-Edge Mask to make center readable and edges refractive */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="25" result="blurredAlpha" />
          <feComponentTransfer in="blurredAlpha" result="invertedAlpha">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feComposite in="smoothNoise" in2="invertedAlpha" operator="in" result="maskedNoise" />

          {/* 5. Chromatic Displacement (refraction) - stronger on the edges using maskedNoise */}
          <feDisplacementMap in="blurred" in2="maskedNoise" scale="30" xChannelSelector="R" yChannelSelector="G" result="redDisplace" />
          <feDisplacementMap in="blurred" in2="maskedNoise" scale="42" xChannelSelector="G" yChannelSelector="B" result="greenBlueDisplace" />

          {/* 6. Extract Channels for Chromatic Separation */}
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0"
            in="redDisplace"
            result="redChannel"
          />

          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 1 0"
            in="greenBlueDisplace"
            result="greenBlueChannels"
          />

          {/* 7. Recombine channels to create subtle chromatic refraction */}
          <feComposite in="redChannel" in2="greenBlueChannels" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="chromaticBg" />

          {/* 8. Apply Saturation (2.2) directly inside SVG */}
          <feColorMatrix type="saturate" values="2.2" in="chromaticBg" result="gradedBg" />

          {/* 9. Specular light / Caustics with animated light position */}
          <feSpecularLighting in="smoothNoise" specularExponent="22" specularConstant="1.4" surfaceScale="2" lightingColor="#ffffff" result="specularLight">
            <feDistantLight azimuth="225" elevation="50">
              <animate attributeName="azimuth" values="225;255;225" dur="45s" repeatCount="indefinite" />
              <animate attributeName="elevation" values="50;62;50" dur="35s" repeatCount="indefinite" />
            </feDistantLight>
          </feSpecularLighting>
          <feBlend mode="overlay" in="specularLight" in2="gradedBg" result="causticsBg" />

          {/* 10. Light scattering (frosted crystal texture feel) */}
          <feFlood floodColor="#ffffff" floodOpacity={0.02} result="scattered" />
          <feBlend mode="screen" in="scattered" in2="causticsBg" result="scatteredBg" />

          {/* 11. Multi-layered Fresnel edge highlights */}
          {/* Highlight 1: Outer crisp reflection */}
          <feMorphology operator="erode" radius="1" in="SourceAlpha" result="eroded1" />
          <feComposite operator="out" in="SourceAlpha" in2="eroded1" result="edgeMask1" />
          <feFlood floodColor="#ffffff" floodOpacity={0.5} result="floodWhite1" />
          <feComposite operator="in" in="floodWhite1" in2="edgeMask1" result="edgeHighlight1" />

          {/* Highlight 2: Inner soft reflection */}
          <feMorphology operator="erode" radius="3.5" in="SourceAlpha" result="eroded2" />
          <feComposite operator="out" in="SourceAlpha" in2="eroded2" result="edgeMask2" />
          <feFlood floodColor="#ffffff" floodOpacity={0.25} result="floodWhite2" />
          <feComposite operator="in" in="floodWhite2" in2="edgeMask2" result="edgeHighlight2" />
          <feGaussianBlur in="edgeHighlight2" stdDeviation="1.5" result="blurredEdgeHighlight2" />

          {/* 12. Final Assembly */}
          <feMerge>
            <feMergeNode in="scatteredBg" />
            <feMergeNode in="edgeHighlight1" />
            <feMergeNode in="blurredEdgeHighlight2" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
