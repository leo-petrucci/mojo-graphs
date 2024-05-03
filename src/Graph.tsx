import { max } from '@visx/vendor/d3-array'
import * as allCurves from '@visx/curve'
import { Group } from '@visx/group'
import { AreaClosed, Line, LinePath } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { PatternLines } from '@visx/pattern'
import { Text } from '@visx/text'
import { LinearGradient } from '@visx/gradient'
import { Axis } from '@visx/axis'
import React from 'react'
import { useTooltip, useTooltipInPortal } from '@visx/tooltip'
import { MortgageData } from './data'

export const background = '#3b6978'
export const background2 = '#204051'
export const accentColor = '#edffea'
export const accentColorDark = '#75daad'

// data accessors
const getX = (d: MortgageData) => d.loan
const getY = (d: MortgageData) => d.lenders

export type GraphProps = {
  width: number
  height: number
  mortgageData: MortgageData[]
  /**
   * Called when a user clicks on a point
   */
  onPointClick?: (data: MortgageData) => void
  /**
   * Decides whether the point is highlighted or not
   */
  isPointClicked?: (data: MortgageData) => boolean
}

export default function Example({
  width,
  height,
  mortgageData,
  onPointClick,
  isPointClicked,
}: GraphProps) {
  // scales
  const xScale = scaleLinear<number>({
    domain: [0, max(mortgageData, getX) as number],
  })
  const yScale = scaleLinear<number>({
    domain: [0, max(mortgageData, getY) as number],
  })

  const svgHeight = height
  const margin = svgHeight / 4

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<{
    type: 'less' | 'equal' | 'more'
    loan: number
    lenders: number
  }>()

  // If you don't want to use a Portal, simply replace `TooltipInPortal` below with
  // `Tooltip` or `TooltipWithBounds` and remove `containerRef`
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  })

  // update scale output ranges
  xScale.range([0, width])
  yScale.range([svgHeight - margin / 2, 0])

  const dataYScale = React.useMemo(
    () =>
      scaleLinear({
        range: [svgHeight - margin + 5],
        domain: [0, max(mortgageData, (d: MortgageData) => d.lenders) || 0],
        nice: true,
      }),
    [svgHeight]
  )

  /**
   * Data points without last
   * returns points we actually have data about
   * used for line
   */
  const internalPoints = React.useMemo(
    () => mortgageData.slice(0, -1),
    [mortgageData]
  )

  /**
   * Data points without last
   * returns points we actually have data about
   * used for line
   */
  const interactablePoints = React.useMemo(
    () => internalPoints.filter((p) => p.deposit || p.likelyHood),
    [internalPoints]
  )

  /**
   * Maximum chart value, rounded up
   */
  const roundedMaxValue = React.useMemo(() => {
    return (
      Math.floor(mortgageData[mortgageData.length - 1].loan / 50000) * 50000
    )
  }, [mortgageData])

  /**
   * The deposit value
   */
  const depositPoint = React.useMemo(() => {
    const depositIndex = mortgageData.findIndex((item) => item.deposit === true)
    return mortgageData.slice(0, depositIndex + 1)
  }, [mortgageData])

  /**
   * The sweetspot value
   */
  const sweetSpotPoint = React.useMemo(() => {
    const sweetSpotIndex = mortgageData.findIndex(
      (item) => item.likelyHood === 'high'
    )
    return mortgageData.slice(0, sweetSpotIndex + 1)
  }, [mortgageData])

  /**
   * The moderate likelyhood value
   */
  const moderateLikelyHoodPoint = React.useMemo(() => {
    // Find the index of the first item with likelyHood: "high"
    const startIndex = mortgageData.findIndex(
      (item) => item.likelyHood === 'high'
    )

    // Find the index of the first item after likelyHood: "moderate"
    const endIndex =
      mortgageData.findIndex((item) => item.likelyHood === 'moderate') + 1

    // Filter the array to include only the desired items
    return mortgageData.slice(startIndex, endIndex)
  }, [mortgageData])

  /**
   * The moderate likelyhood value
   */
  const lowLikelyHoodPoint = React.useMemo(() => {
    // Find the index of the first item with likelyHood: "moderate"
    const startIndex = mortgageData.findIndex(
      (item) => item.likelyHood === 'moderate'
    )

    // Find the index of the first item after likelyHood: "low"
    const endIndex =
      mortgageData.findIndex((item) => item.likelyHood === 'low') + 1

    // Filter the array to include only the desired items
    return mortgageData.slice(startIndex, endIndex)
  }, [mortgageData])

  const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  })

  const shortCurrencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 0,
  })

  return (
    <div className="visx-curves-demo">
      <svg width={width} height={svgHeight} ref={containerRef}>
        <rect
          fill="#000928"
          x={0}
          y={0}
          width={width}
          height={svgHeight - margin / 3}
          rx={16}
        />
        <LinearGradient id="area-gradient" from={'#3b4258'} to={'#3b4258'} />
        <LinearGradient
          id="affordable-gradient"
          from={'#80fec1'}
          to={'#80fec1'}
          vertical={false}
        />
        <LinearGradient
          id="moderate-gradient"
          from={'#ffc47f'}
          to={'#ffc47f'}
          vertical={false}
        />
        <LinearGradient
          id="low-gradient"
          from={'#fe8080'}
          to={'#fe8080'}
          vertical={false}
        />
        <PatternLines
          id="deposit-lines"
          height={10}
          width={10}
          stroke={'#01e476'}
          strokeWidth={2}
          orientation={['diagonal']}
        />

        <Group key={`lines`} left={margin / 8} top={margin / 2}>
          {/* Renders gray background graph */}
          <AreaClosed<MortgageData>
            data={[...mortgageData]}
            x={(d) => xScale(getX(d)) ?? 0}
            y={(d) => yScale(getY(d)) ?? 0}
            yScale={dataYScale}
            fill="url(#area-gradient)"
            curve={allCurves['curveLinear']}
          />

          {/* Renders internal green graph */}
          <AreaClosed<MortgageData>
            data={sweetSpotPoint}
            x={(d) => xScale(getX(d)) ?? 0}
            y={(d) => yScale(getY(d)) ?? 0}
            strokeWidth={2}
            yScale={dataYScale}
            fill="url(#affordable-gradient)"
            stroke="url(#affordable-gradient)"
            curve={allCurves['curveLinear']}
          />

          {/* Renders internal yellow graph */}
          <AreaClosed<MortgageData>
            data={moderateLikelyHoodPoint}
            x={(d) => xScale(getX(d)) ?? 0}
            y={(d) => yScale(getY(d)) ?? 0}
            yScale={dataYScale}
            fill="url(#moderate-gradient)"
            stroke="url(#moderate-gradient)"
            curve={allCurves['curveLinear']}
          />

          {/* Renders internal red graph */}
          <AreaClosed<MortgageData>
            data={lowLikelyHoodPoint}
            x={(d) => xScale(getX(d)) ?? 0}
            y={(d) => yScale(getY(d)) ?? 0}
            yScale={dataYScale}
            fill="url(#low-gradient)"
            stroke="url(#low-gradient)"
            curve={allCurves['curveLinear']}
          />

          {/* Renders the deposit dashes */}
          <AreaClosed<MortgageData>
            data={depositPoint}
            x={(d) => xScale(getX(d)) ?? 0}
            y={(d) => yScale(getY(d)) ?? 0}
            strokeWidth={2}
            yScale={dataYScale}
            fill="url(#deposit-lines)"
            curve={allCurves['curveLinear']}
          />

          {/* Renders orange line */}
          <LinePath<MortgageData>
            curve={allCurves['curveLinear']}
            data={internalPoints}
            x={(d) => xScale(getX(d)) ?? 0}
            y={(d) => yScale(getY(d)) ?? 0}
            strokeWidth={2}
            stroke="#fff"
          />

          <Text
            x={xScale(getX(depositPoint[1])) / 2}
            y={(svgHeight - margin) / 2}
            angle={-90}
            width={width}
            verticalAnchor="middle"
            textAnchor="middle"
            fontSize={14}
            fontWeight={600}
            fill={'#000928'}
          >
            Deposit
          </Text>
        </Group>

        <rect
          stroke="#000928"
          strokeWidth={20}
          fill="transparent"
          x={10}
          y={10}
          width={width - 20}
          height={svgHeight - margin / 3 - 20}
          rx={16}
          ry={16}
          style={{
            pointerEvents: 'none',
          }}
        />

        <Group left={margin / 8} top={margin / 2}>
          {/* Renders circles */}
          {interactablePoints.map((d) => (
            <React.Fragment key={d.loan}>
              {isPointClicked?.(d) && (
                <circle
                  cx={xScale(getX(d))}
                  cy={yScale(getY(d))}
                  fill="white"
                  r="20"
                >
                  <animate
                    attributeName="r"
                    from="16"
                    to="28"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.7"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                r={isPointClicked?.(d) ? 16 : 8}
                cx={xScale(getX(d))}
                cy={yScale(getY(d))}
                fill="white"
              />
              <circle
                r={isPointClicked?.(d) ? 8 : 4}
                cx={xScale(getX(d))}
                cy={yScale(getY(d))}
                fill="#000928"
              />
            </React.Fragment>
          ))}

          {/* Renders hoverable circles */}
          {interactablePoints.map((p) => {
            return (
              <circle
                key={p.loan}
                r={16}
                cx={xScale(getX(p))}
                cy={yScale(getY(p))}
                fill="transparent"
                onClick={() => {
                  onPointClick?.(p)
                }}
                style={{
                  cursor: 'pointer',
                }}
              />
            )
          })}

          {/* Renders home icon */}
          {internalPoints.map((p) => {
            if (p.likelyHood === 'high')
              return (
                <React.Fragment key={p.loan}>
                  <circle
                    r={28}
                    cx={xScale(getX(p)) + 14}
                    cy={yScale(getY(p)) + svgHeight - margin}
                    fill="#000928"
                    color="#fff"
                    style={{
                      cursor: 'pointer',
                    }}
                  />
                  <Group
                    left={xScale(getX(p)) - 9 + 14}
                    top={yScale(getY(p)) + svgHeight - margin - 9}
                    style={{
                      pointerEvents: 'none',
                    }}
                  >
                    <path
                      d="M8.6025 2.88075C8.70797 2.77541 8.85094 2.71625 9 2.71625C9.14906 2.71625 9.29203 2.77541 9.3975 2.88075L15.915 9.39825C15.9669 9.45195 16.029 9.49477 16.0976 9.52422C16.1663 9.55367 16.2401 9.56915 16.3148 9.56976C16.3895 9.57038 16.4635 9.55611 16.5327 9.52779C16.6018 9.49948 16.6646 9.45768 16.7173 9.40484C16.7701 9.352 16.8119 9.28918 16.8401 9.22004C16.8684 9.15089 16.8826 9.07682 16.8819 9.00213C16.8812 8.92744 16.8657 8.85364 16.8361 8.78503C16.8066 8.71641 16.7637 8.65436 16.71 8.6025L10.1932 2.085C10.0366 1.9283 9.85052 1.804 9.64578 1.71919C9.44104 1.63438 9.22161 1.59074 9 1.59074C8.77839 1.59074 8.55896 1.63438 8.35422 1.71919C8.14948 1.804 7.96345 1.9283 7.80675 2.085L1.28925 8.6025C1.23555 8.65441 1.19273 8.7165 1.16328 8.78514C1.13383 8.85379 1.11835 8.9276 1.11774 9.00229C1.11712 9.07698 1.13139 9.15104 1.15971 9.22016C1.18802 9.28927 1.22982 9.35206 1.28266 9.40485C1.3355 9.45764 1.39832 9.49938 1.46746 9.52763C1.53661 9.55588 1.61068 9.57007 1.68537 9.56939C1.76006 9.56871 1.83386 9.55315 1.90247 9.52364C1.97109 9.49413 2.03314 9.45125 2.085 9.3975L8.6025 2.88075Z"
                      fill="white"
                    />
                    <path
                      d="M9 4.074L15.1193 10.1932C15.1418 10.2157 15.1643 10.2368 15.1875 10.2578V14.9063C15.1875 15.6825 14.5575 16.3125 13.7812 16.3125H11.25C11.1008 16.3125 10.9577 16.2532 10.8523 16.1477C10.7468 16.0423 10.6875 15.8992 10.6875 15.75V12.375C10.6875 12.2258 10.6282 12.0827 10.5227 11.9773C10.4173 11.8718 10.2742 11.8125 10.125 11.8125H7.875C7.72582 11.8125 7.58274 11.8718 7.47725 11.9773C7.37176 12.0827 7.3125 12.2258 7.3125 12.375V15.75C7.3125 15.8992 7.25324 16.0423 7.14775 16.1477C7.04226 16.2532 6.89918 16.3125 6.75 16.3125H4.21875C3.84579 16.3125 3.4881 16.1643 3.22438 15.9006C2.96066 15.6369 2.8125 15.2792 2.8125 14.9063V10.2578C2.83583 10.2369 2.85859 10.2154 2.88075 10.1932L9 4.074Z"
                      fill="white"
                    />
                  </Group>
                </React.Fragment>
              )
          })}
        </Group>

        <Group top={svgHeight - margin / 2 + 20} left={margin / 8}>
          <Axis
            key={`loan-axis`}
            orientation={'bottom'}
            numTicks={roundedMaxValue / 50000}
            scale={xScale}
            hideAxisLine
            hideTicks
            tickFormat={(v) => shortCurrencyFormatter.format(Number(v))}
            tickComponent={({ formattedValue, ...props }) => {
              return (
                <Text
                  {...props}
                  color={'#3B4258'}
                  fontSize={12}
                  fontWeight={500}
                >
                  {formattedValue}
                </Text>
              )
            }}
          />
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          style={{
            width: '200px',
            position: 'absolute',
            backgroundColor: 'white',
            color: 'rgb(102, 102, 102)',
            padding: '0.3rem 0.5rem',
            borderRadius: '3px',
            fontSize: '14px',
            boxShadow: 'rgba(33, 33, 33, 0.2) 0px 1px 2px',
            lineHeight: '1.5em',
            pointerEvents: 'none',
          }}
          top={tooltipTop}
          left={tooltipLeft}
        >
          {tooltipData.type === 'less' && (
            <>
              You will definitely be able to get a loan of{' '}
              <strong>{currencyFormatter.format(tooltipData.loan)}</strong> from{' '}
              <strong>{tooltipData.lenders} lenders</strong> at a lower than
              average interest rate.
            </>
          )}

          {tooltipData.type === 'more' && (
            <>
              You might be able to get a loan of{' '}
              <strong>{currencyFormatter.format(tooltipData.loan)}</strong> from{' '}
              <strong>{tooltipData.lenders} lenders</strong> at a higher than
              average interest rate.
            </>
          )}

          {tooltipData.type === 'equal' && (
            <>
              This is your sweet spot, you should be able to get a loan of{' '}
              <strong>{currencyFormatter.format(tooltipData.loan)}</strong> from{' '}
              <strong>{tooltipData.lenders} lenders</strong> at an average
              interest rate.
            </>
          )}
        </TooltipInPortal>
      )}
    </div>
  )
}
