import React from 'react'
import { createRoot } from 'react-dom/client'
import ParentSize from '@visx/responsive/lib/components/ParentSize'
import Example from './Graph'
import './index.css'
import { MortgageData, mortgageData } from './data'

const Main = () => {
  const highLikelyhoodLoan = React.useMemo(() => {
    return mortgageData.find((d) => d.likelyHood === 'high')
  }, [mortgageData])

  const maxLoan = React.useMemo(() => {
    return mortgageData.find((d) => d.likelyHood === 'low')
  }, [mortgageData])

  const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  })

  const [highlight, setHighlight] = React.useState({
    likelyHood: 'high',
    borrowingString: `Borrowing £0 - ${currencyFormatter.format(
      highLikelyhoodLoan?.loan || 0
    )}`,
    lenders: String(highLikelyhoodLoan?.lenders),
    interestRate: String(highLikelyhoodLoan?.interestRate),
    loan: String(highLikelyhoodLoan?.loan),
    averagePayment: currencyFormatter.format(1234),
  })

  const findNextData = (direction: 'prev' | 'next') => {
    const filteredData = mortgageData
      // keep only values with deposit and likelyhood
      .filter((d) => d.deposit !== undefined || d.likelyHood !== undefined)

    // find the current index
    const dataIndex = filteredData.findIndex(
      (d) => String(d.loan) === highlight.loan
    )

    // if the current element is the last in the array restart
    if (dataIndex >= filteredData.length - 1 && direction === 'next') {
      const newData = filteredData[0]
      doChangeData(newData)
      // if it's first, go to last item
    } else if (dataIndex === 0 && direction === 'prev') {
      const newData = filteredData[filteredData.length - 1]

      doChangeData(newData)
    } else {
      // for every other case
      const newData =
        filteredData[direction === 'next' ? dataIndex + 1 : dataIndex - 1]

      doChangeData(newData)
    }
  }

  const doChangeData = (data: MortgageData) => {
    // special case if we display deposit
    if (data.deposit === true) {
      const depositData = mortgageData.find((d) => d.deposit === true)
      setHighlight({
        likelyHood: 'high',
        borrowingString: `Deposit ${currencyFormatter.format(
          highLikelyhoodLoan?.loan || 0
        )}`,
        lenders: '-',
        interestRate: '-',
        loan: String(depositData?.loan),
        averagePayment: '-',
      })
      return
    }
    // find index of the data being changed
    const dataIndex = mortgageData.findIndex((d) => d.loan === data.loan)
    // find the previous data point for comparison
    const previousPoint = mortgageData[dataIndex - 1]

    if (data.likelyHood) {
      // set data for the other cases
      setHighlight({
        likelyHood: data.likelyHood,
        borrowingString: `Borrowing ${currencyFormatter.format(
          previousPoint?.loan || 0
        )} - ${currencyFormatter.format(data?.loan || 0)}`,
        lenders: String(data?.lenders),
        interestRate: String(data?.interestRate),
        loan: String(data?.loan),
        averagePayment: currencyFormatter.format(1234),
      })
      return
    }
  }

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <div className="graph__elements">
        {/* Static elements */}
        <div className="graph__elements--static">
          <div className="graph__elements--staticElement">
            <span className="caption">You can comfortably borrow up to</span>
            <span className="loan">
              {currencyFormatter.format(highLikelyhoodLoan!.loan)}
            </span>
          </div>
          <div className="graph__elements--staticElement">
            <span className="caption">Your maximum borrowing amount is</span>
            <span className="loan">
              {currencyFormatter.format(maxLoan!.loan)}
            </span>
          </div>
        </div>

        {/* Interactable elements */}
        <div className="graph__elements--interactable">
          <div className="interactable__top">
            <div className="borrowingRange">
              <div className={`dot ${highlight.likelyHood}-bg`} />
              {highlight.borrowingString}
            </div>
            <div className={`likelyhoodSwitch ${highlight.likelyHood}-text`}>
              <button
                onClick={() => {
                  findNextData('prev')
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 256 256"
                >
                  <rect width="256" height="256" fill="none" />
                  <polyline
                    points="160 208 80 128 160 48"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  />
                </svg>
              </button>
              {highlight.likelyHood} likelyhood
              <button
                onClick={() => {
                  findNextData('next')
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 256 256"
                >
                  <rect width="256" height="256" fill="none" />
                  <polyline
                    points="96 48 176 128 96 208"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="interactable__bottom">
            <div className="info__container left">
              <div className="value">{highlight.lenders}</div>
              <div className="caption">No of lenders</div>
            </div>
            <div className="info__container center">
              <div className="value">{highlight.interestRate}%</div>
              <div className="caption">Avg interest rate</div>
            </div>
            <div className="info__container right">
              <div className="value">{highlight.lenders}</div>
              <div className="caption">No of lenders</div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: -28,
          height: 500,
        }}
      >
        <ParentSize>
          {({ width, height }) => (
            <Example
              mortgageData={mortgageData}
              width={width}
              height={height}
              onPointClick={(data) => {
                doChangeData(data)
              }}
              isPointClicked={(data) => {
                return String(data.loan) === highlight.loan
              }}
            />
          )}
        </ParentSize>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)

root.render(
  <div
    style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Main />
  </div>
)
