import * as echarts from 'echarts';
import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import Axios from "axios";
import { ComponentProps, ComponentRef } from '@/components/views/dashboardView/dsl/Component';
import { dataSymbolTask } from 'echarts/types/src/visual/symbol.js';
import { convertToEC4StyleForCustomSerise } from 'echarts/types/src/util/styleCompat.js';

type ChartComponentProps = ComponentProps;

const ChartComponent = forwardRef<ComponentRef, ChartComponentProps>(({blueprint}: ChartComponentProps, ref) => {
    const chartContainerRef = useRef(null);
    const [ data, setData ] = useState<any|null>(null);
    const [ chartOptions, setChartOptions ] = useState<any>({});
    const [ currentDate, setCurrentDate ] = useState(() => {
        const date = new Date();
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1
        };
    });

    const getMonthName = (monthNumber: number): string => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[monthNumber - 1] || '';
    };

    const reload = () => {
        //const chart = echarts.init(chartContainerRef.current);
        //if (chart.setOption) {
        //    chart.setOption(chartOptions);
        //}
    };

    const goToPreviousMonth = () => {
        setCurrentDate(prev => {
            let newMonth = prev.month - 1;
            let newYear = prev.year;
            
            if (newMonth < 1) {
                newMonth = 12;
                newYear = prev.year - 1;
            }
            
            return { year: newYear, month: newMonth };
        });
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => {
            let newMonth = prev.month + 1;
            let newYear = prev.year;
            
            if (newMonth > 12) {
                newMonth = 1;
                newYear = prev.year + 1;
            }
            
            return { year: newYear, month: newMonth };
        });
    };

    useImperativeHandle(ref, () => {
        return {
            reload
        };
    });

    useEffect(() => {
        Axios.get("https://app.bimachine.com/api/publisher/bigtable?content=%2Ftreinamento%2F24059%2F68048.bigtable&removeFrame=true&view=JSON")
            .then(result => {
                const d = result.data.queryResult;

                const rows: {[key: string]: string} = {};
                const cols: {[key: string]: string} = {};

                blueprint.rows.forEach(row => {
                    rows[row] = d.map((r: any) => {
                        return r[row];
                    }).filter((r: any) => r !== undefined);
                });

                blueprint.columns.forEach(column => {
                    let key = column;
                    if (d[0][key] === undefined) {
                        const objKeys = Object.keys(d[0]);
                        for (let i = 0; i < objKeys.length; i++) {
                            const k = objKeys[i];
                            const dot = k.indexOf('.');
                            if (dot === -1) {
                                continue;
                            }
                            const val = k.substring(0, dot);
                            if (val === key) {
                                key = k;
                                break;
                            }
                        }
                    }
                    cols[column] = d.map((c: any) => c[key]).filter((c: any) => c !== undefined);
                });

                setData({rows, cols});
            });
    }, []);

    useEffect(() => {
        const buildDates = () => {
            const date = new Date(currentDate.year, currentDate.month - 1, 1);
            const year = currentDate.year;
            const month = currentDate.month;

            const days: any[] = [];

            // Determine number of leading days from previous month to fill the first week (Monday-first)
            const firstDateOfMonth = new Date(year, month - 1, 1);
            let firstWeekday = firstDateOfMonth.getDay(); // 0=Sun,1=Mon,...6=Sat
            if (firstWeekday === 0) firstWeekday = 7; // Treat Sunday as 7 for Monday-first
            const extraPrevMonthDays = (firstWeekday + 6) % 7; // 0..6 number of days before Monday

            const prevMonth = month === 1 ? 12 : month - 1;
            const prevYear = month === 1 ? year - 1 : year;
            const prevMonthLastDay = new Date(year, month - 1, 0).getDate();

            // Add leading days from previous month
            for (let i = extraPrevMonthDays; i > 0; i--) {
                const dayNum = prevMonthLastDay - i + 1;
                days.push([`${prevYear}-${prevMonth}-${dayNum}`]);
            }

            // Push all days of current month
            while (date.getMonth() + 1 === month) {
                const day = date.getDate();
                days.push([`${year}-${month}-${day}`]);
                date.setDate(day + 1);
            }

            // date currently points to the first day of next month
            const lastDayOfMonth = new Date(year, month, 0).getDate();
            const lastDate = new Date(year, month - 1, lastDayOfMonth);
            // In JS getDay(): 0=Sun, 1=Mon, ... 6=Sat. We are using Monday as first day (firstDay:1)
            let lastWeekday = lastDate.getDay();
            if (lastWeekday === 0) lastWeekday = 7; // Treat Sunday as 7 for Monday-first
            const extraNextMonthDays = (7 - lastWeekday) % 7; // 0..6

            // Add trailing days from next month to fill the last week
            if (extraNextMonthDays > 0) {
                const nextMonth = month === 12 ? 1 : month + 1;
                const nextYear = month === 12 ? year + 1 : year;
                for (let i = 1; i <= extraNextMonthDays; i++) {
                    days.push([`${nextYear}-${nextMonth}-${i}`]);
                }
            }

            // Compute start and end range to include the leading and trailing adjacent-month days
            const startRangeDate = extraPrevMonthDays > 0
                ? new Date(prevYear, prevMonth - 1, prevMonthLastDay - extraPrevMonthDays + 1)
                : new Date(year, month - 1, 1);
            const startYear = startRangeDate.getFullYear();
            const startMonth = startRangeDate.getMonth() + 1;
            const startDay = startRangeDate.getDate();

            const endRangeDate = extraNextMonthDays > 0
                ? new Date(year, month - 1, lastDayOfMonth + extraNextMonthDays)
                : new Date(year, month - 1, lastDayOfMonth);
            const endYear = endRangeDate.getFullYear();
            const endMonth = endRangeDate.getMonth() + 1;
            const endDay = endRangeDate.getDate();

            return {
                days,
                range: { year, month, startYear, startMonth, startDay, endYear, endMonth, endDay }
            } as {days: any[][], range: {year: number, month: number, startYear: number, startMonth: number, startDay: number, endYear: number, endMonth: number, endDay: number}};
        }

        const dates = buildDates();
        const dateList = dates.days;
        const keys = Object.keys(data?.rows ?? {});

        const bimDates = dates.days.map(day => {
            const parts = day[0].split('-');
            const dayPart = parseInt(parts[2]);
            const monthPart = parseInt(parts[1]);
            const yearPart = parts[0];
            return `${dayPart < 10 ? '0' : ''}${dayPart}/${monthPart < 10 ? '0' : ''}${monthPart}/${yearPart}`;
        });

        if (data?.cols) {
            Object.keys(data?.cols).forEach(key => {
                bimDates.forEach((date, index) => {
                    const idx = data?.cols[key].findIndex((d: string) => d === date);
                    if (idx !== -1) {
                        const val: {[key: string]: string} = {};
                        keys.forEach(rowKey => {
                            val[rowKey] = data.rows[rowKey][idx];
                        })
                        dates.days[index].push(val);
                    }
                })
            });
        }

        // Build per-date ranks while preserving original indices
        const valuesWithIndex = dateList.map((date, idx) => {
            const meta = date[1];
            let numeric = 0;
            if (meta && typeof meta === 'object') {
                const vals = Object.values(meta as Record<string, unknown>);
                const first = vals[0];
                const num = typeof first === 'number' ? first : parseFloat(String(first).replace(/\./g, '').replace(/,/g, '.'));
                numeric = isNaN(num) ? 0 : num;
            } else if (typeof meta === 'number' || typeof meta === 'string') {
                const num = typeof meta === 'number' ? meta : parseFloat(String(meta).replace(/\./g, '').replace(/,/g, '.'));
                numeric = isNaN(num) ? 0 : num;
            }
            return { idx, value: numeric };
        });
        const nonZero = valuesWithIndex.filter(v => v.value > 0);
        nonZero.sort((a, b) => a.value - b.value);

        const rankPerIndex: number[] = new Array(dateList.length).fill(0);
        let currentRank = 0;
        for (let i = 0; i < nonZero.length; i++) {
            currentRank += 1;
            rankPerIndex[nonZero[i].idx] = currentRank;
        }
        const hasData = nonZero.length > 0;
        const minRank = hasData ? 1 : 0;
        const maxRank = hasData ? currentRank : 1;

        const heatmapDataCurrent: any[] = [];
        const heatmapDataOverflow: any[] = [];
        const daylabels: any[] = [];
        for (let i = 0; i < dateList.length; i++) {
            const dateStr = dateList[i][0] as string;
            const [yy, mm] = dateStr.split('-').map(v => parseInt(v, 10));
            const isCurrentMonth = (yy === currentDate.year && mm === currentDate.month);

            // Label per day, gray out if not in current month
            daylabels.push({
                value: [dateStr],
                label: {
                    color: isCurrentMonth ? '#000' : '#aaa'
                }
            });

            // Use rank per calendar index; assign out-of-range (minRank-1) for overflow
            const rankValue = rankPerIndex[i] ?? 0;
            if (isCurrentMonth) {
                heatmapDataCurrent.push([dateStr, rankValue]);
            } else {
                heatmapDataOverflow.push([dateStr, (minRank - 1)]);
            }
        }

        // visualMap domain: use rank bounds
        const minValue = minRank;
        const maxValue = maxRank;

        dateList.forEach(date => {
            if (date[1] === undefined) {
                return;
            }

            keys.forEach((key, idx) => {
                
            });
        })

        const options = {
            tooltip: {
                formatter: function (params: any) {
                    const dataArr = Array.isArray(params.data) ? params.data : params.value;
                    const dateKey = Array.isArray(dataArr) ? dataArr[0] : undefined;
                    if (!dateKey) return '';
                    const idx = dateList.findIndex(d => d[0] === dateKey);
                    if (idx === -1) return '';
                    const meta = dateList[idx][1];
                    if (meta && typeof meta === 'object') {
                        const metaKeys = Object.keys(meta);
                        let value = '';
                        metaKeys.forEach((key, i) => {
                            value += `${key}: ${meta[key]}`;
                            if (i < metaKeys.length - 1) value += '<br/>';
                        });
                        return value;
                    }
                    return '';
                }
            },
            visualMap: {
                show: false,
                min: minValue,
                max: maxValue,
                calculable: true,
                seriesIndex: [1, 2], // include both heatmap series (current and overflow)
                orient: 'horizontal',
                left: 'center',
                bottom: 20,
                inRange: {
                    color: ['#e0ffff', '#006edd'],
                    opacity: 0.3
                },
                outOfRange: {
                    color: '#cccccc',
                    opacity: 0.4
                },
                controller: {
                    inRange: {
                        opacity: 0.5
                    }
                }
            },
            grid: {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                outerBounds: {
                    left: 0 ,
                    top: 0 ,
                    right: 0 ,
                    bottom: 0 ,
                    width: 'auto' ,
                    height: 'auto' ,
                }
            },
            calendar: [
                {
                    left: 0,
                    top: 0,
                    cellSize: ['auto', 'auto'],
                    yearLabel: { show: false },
                    orient: 'vertical',
                    dayLabel: {
                        firstDay: 1,
                        nameMap: 'cn'
                    },
                    monthLabel: {
                        show: false
                    },
                    range: [
                        `${dates.range.startYear}-${dates.range.startMonth}-${dates.range.startDay}`,
                        `${dates.range.endYear}-${dates.range.endMonth}-${dates.range.endDay}`
                    ],
                }
            ],
            series: [
                {
                    type: 'scatter',
                    coordinateSystem: 'calendar',
                    symbolSize: 0,
                    label: {
                        show: true,
                        formatter: function (params: any) {
                            var d = echarts.number.parseDate(params.value[0]);
                            return d.getDate();
                        },
                        color: '#000'
                    },
                    data: [],
                    silent: true
                },
                {
                    name: blueprint.name,
                    type: 'heatmap',
                    coordinateSystem: 'calendar',
                    data: heatmapDataCurrent
                },
                {
                    name: `${blueprint.name}-overflow`,
                    type: 'heatmap',
                    coordinateSystem: 'calendar',
                    data: heatmapDataOverflow,
                    tooltip: { show: false },
                    silent: true
                }
            ]
        };

        console.log("Data", {daylabels, heatmapDataCurrent, heatmapDataOverflow});

        setChartOptions(options);
    }, [data, currentDate]);

    useEffect(() => {
        const chart = echarts.init(chartContainerRef.current);
        if (chart.setOption) {
            chart.setOption(chartOptions);
        }
    }, [chartOptions]);

    const WrapperComponent = useMemo(() => {
        return ({children}: {children: React.ReactNode}) => {
            if (blueprint.subType === 'calendar') {
                return (
                    <div className="w-full h-full border grid grid-rows-[auto_auto_1fr]">
                        <div className="grid grid-cols-7 border-b h-[2rem]">
                            <div className="w-full h-[2rem] text-[1.6rem] border-r flex justify-center items-center cursor-pointer" onClick={goToPreviousMonth}>&lt;</div>
                            <div className="flex justify-center items-center border-r col-span-5 text-[1rem]">{getMonthName(currentDate.month)} {currentDate.year}</div>
                            <div className="w-full h-[2rem] text-[1.6rem] flex justify-center items-center cursor-pointer" onClick={goToNextMonth}>&gt;</div>
                        </div>
                        <div className="h-[1rem] grid grid-cols-7 *:flex *:justify-center *:items-center *:border-r *:border-b *:last:border-r-0 text-[0.8rem]">
                            <div>Seg</div>
                            <div>Ter</div>
                            <div>Qua</div>
                            <div>Qui</div>
                            <div>Sex</div>
                            <div>Sab</div>
                            <div>Dom</div>
                        </div>
                        {children}
                    </div>
                )
            }
            return <div className="w-full h-full">{children}</div>
        };
    }, [blueprint.subType, currentDate]);

    return <WrapperComponent><div ref={chartContainerRef} className="w-full h-full"></div></WrapperComponent>;
});

export default ChartComponent;