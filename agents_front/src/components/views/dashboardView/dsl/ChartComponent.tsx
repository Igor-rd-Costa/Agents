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
        console.log("Chart reloading!");
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

                console.log("Blueprint", d);
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
                console.log("Data", {rows, cols});
            });
    }, []);

    useEffect(() => {
        const buildDates = () => {
            const date = new Date(currentDate.year, currentDate.month - 1, 1);
            const year = currentDate.year;
            const month = currentDate.month;

            const days = [];
            console.log("Month", month);
            while (date.getMonth() + 1 === month) {
                const day = date.getDate();
                days.push([`${year}-${month}-${day}`]);
                date.setDate(day + 1);
            }

            return {
                days,
                range: {year, month}
            } as {days: any[][], range: {year: number, month: number}};
        }

        const dates = buildDates();
        const dateList = dates.days;
        const keys = Object.keys(data?.rows ?? {});

        const bimDates = dates.days.map(day => {
            const parts = day[0].split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        });

        if (data?.cols) {
            console.log("Cols", data?.cols);
            Object.keys(data?.cols).forEach(key => {
                bimDates.forEach((date, index) => {
                    const idx = data?.cols[key].findIndex(d => d === date);
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

        const heatRanking = dateList
            .map(date => {
                const d = date[1] ?? 0;
                return d;
            })
            .sort(data => {
                if (data === 0) {
                    return -1;
                }
                return 1;
            });
        console.log("Rank", heatRanking);
        const heatmapData = [];
        const daylabels = [];
        for (let i = 0; i < dateList.length; i++) {
            heatmapData.push([dateList[i][0], dateList[i][1] ?? '', Math.random() * 300]);
            daylabels.push([dateList[i][0]]);
        }

        // Calculate min and max values from heatmap data for proper color mapping
        const heatmapValues = heatmapData.map(item => item[2]).filter(val => val !== undefined);
        const minValue = Math.min(...heatmapValues);
        const maxValue = Math.max(...heatmapValues);

        console.log("Date", heatmapData);
        dateList.forEach(date => {
            if (date[1] === undefined) {
                return;
            }

            keys.forEach((key, idx) => {
                
            });
        })

        const options = {
            tooltip: {
                formatter: function (params) {
                    let value = '';
                    Object.keys(params.data[1]).forEach((key, idx) => {
                        value += `${key}: ${params.data[1][key]}`;
                        if (idx < keys.length - 1) {
                            value += '<br/>';
                        }
                    });
                    return value;
                }
            },
            visualMap: {
                show: false,
                min: minValue,
                max: maxValue,
                calculable: true,
                seriesIndex: [1], // Fixed: heatmap series is at index 1
                orient: 'horizontal',
                left: 'center',
                bottom: 20,
                inRange: {
                    color: ['#e0ffff', '#006edd'],
                    opacity: 0.3
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
                    cellSize: [92.57, 91.6],
                    yearLabel: { show: false },
                    orient: 'vertical',
                    dayLabel: {
                        firstDay: 1,
                        nameMap: 'cn'
                    },
                    monthLabel: {
                        show: false
                    },
                    range: `${dates.range.year}-${dates.range.month}`,
                }
            ],
            series: [
                {
                    type: 'scatter',
                    coordinateSystem: 'calendar',
                    symbolSize: 0,
                    label: {
                        show: true,
                        formatter: function (params) {
                            var d = echarts.number.parseDate(params.value[0]);
                            return d.getDate();
                        },
                        color: '#000'
                    },
                    data: daylabels,    
                    silent: true
                },
                {
                    name: blueprint.name,
                    type: 'heatmap',
                    coordinateSystem: 'calendar',
                    data: heatmapData
                }
            ]
        };

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
                    <div className="w-full h-full border grid grid-rows-[auto_1fr]">
                        <div className="grid grid-cols-[auto_1fr_auto] border-b h-[2.5rem]">
                            <div className="w-[2.5rem] h-[2.5rem] text-[1.6rem] border-r flex justify-center items-center ml-4 pr-4 cursor-pointer" onClick={goToPreviousMonth}>&lt;</div>
                            <div className="flex justify-center items-center text-[1.6rem]">{getMonthName(currentDate.month)} {currentDate.year}</div>
                            <div className="w-[2.5rem] h-[2.5rem] text-[1.6rem] col-start-3 border-l flex justify-center items-center mr-4 pl-4 cursor-pointer" onClick={goToNextMonth}>&gt;</div>
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