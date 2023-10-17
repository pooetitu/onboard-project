import * as React from "react";
import {Volume} from "../../types/volume";
import {axisClasses, LineChart} from "@mui/x-charts";
import {formatUnits} from "viem";
import {format} from "date-fns";

export default function TransferVolume({volume, busdDecimals}: {
  volume: Volume[],
  busdDecimals: number,
}) {
  const map = getYearDates();
  volume.forEach(value=> map.set(format(new Date(value.date), "d/MM/yyyy"), value));
  const transferredAmount = Array.from(map.values()).map(value => Number(formatUnits(BigInt(value.amount), busdDecimals)));
  const transactionsCount = Array.from(map.values()).map(value => value.transactions);
  const labels = Array.from(map.keys());
  if (volume.length <= 0) {
    return (<></>);
  }
  return (
    <LineChart
      width={1000}
      height={700}
      yAxis={[
        {id: 'linearAxis', scaleType: 'linear'},
        {id: 'logAxis', scaleType: 'linear'},
      ]}
      series={[
        {data: transactionsCount, label: 'Transactions', yAxisKey: 'logAxis'},
        {data: transferredAmount, label: 'Amount transferred', yAxisKey: 'linearAxis'},
      ]}
      xAxis={[{scaleType: 'point', data: labels,}]}
      rightAxis="logAxis"
      sx={{
        padding: '50px',
        [`.${axisClasses.bottom}`]: {
          [`.${axisClasses.tickLabel}`]: {
            transform: 'rotate(45deg)',
            dominantBaseline: 'hanging',
            textAnchor: 'start',
          },
          [`.${axisClasses.label}`]: {
            transform: 'translateY(15px)',
          },
        },
        '--ChartsLegend-itemWidth': '110px',
      }}
    />
  );
}

function getYearDates() {
  const map = new Map<string, Volume>();
  const stopDate = new Date();
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate()-365);
  while (currentDate < stopDate) {
    map.set(format(currentDate, "d/MM/yyyy"), {
      date: '',
      transactions: 0,
      amount: '0'
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return map;
}