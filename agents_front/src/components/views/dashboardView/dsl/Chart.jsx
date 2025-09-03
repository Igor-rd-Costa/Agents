import * as echarts from 'echarts';
import {useEffect, useRef, useState} from "react";
import Axios from "axios";

export default function Chart({blueprint}) {
    const chartContainerRef = useRef(null);
    const [ data, setData ] = useState(null);

    useEffect(() => {
        Axios.get("https://app.bimachine.com/api/publisher/bigtable?content=%2Ftreinamento%2F24059%2F68048.bigtable&removeFrame=true&view=JSON")
            .then(result => {
                const d = result.data.queryResult.rows;

                console.log("Blueprint", blueprint);
                const rows = {};
                const cols = {};

                blueprint.rows.forEach(row => {
                    rows[row] = d.map(r => {
                        const key = `[${row}]`;
                        return r[key];
                    }).filter(r => r !== undefined);
                });

                blueprint.columns.forEach(column => {
                    let key = `[${column}]`;
                    if (d[0][key] === undefined) {
                        const objKeys = Object.keys(d[0]);
                        for (let i = 0; i < objKeys.length; i++) {
                            const k = objKeys[i];
                            const dot = k.indexOf('.');
                            if (dot === -1) {
                                continue;
                            }
                            const val = k.substring(0, dot) + ']';
                            if (val === key) {
                                key = k;
                                break;
                            }
                        }
                    }
                    cols[column] = d.map(c => c[key]).filter(c => c !== undefined);
                });



                setData({rows, cols});
                console.log("Data", {rows, cols});
            });
    }, []);

    useEffect(() => {
       const chart = echarts.init(chartContainerRef.current);

       const option = {
           backgroundColor: blueprint.backgroundColor || '#ffffff',
           title: {
               text: blueprint.name,
               left: 'center',
               textStyle: {
                   color: '#ffffff'
               }
           },
           tooltip: {
               trigger: 'axis',
               axisPointer: {
                   type: 'shadow'
               }
           },
           legend: {
               data: blueprint.rows,
               top: '10%',
               textStyle: {
                   color: '#ffffff'
               }
           },
           grid: {
               left: '3%',
               right: '4%',
               bottom: '3%',
               top: '20%',
               containLabel: true
           },
           xAxis: {
               type: 'category',
               data: [["A"], ["B", "Y"], ["C", "X"]],
               axisLabel: {
                   color: '#ffffff'
               },
               axisLine: {
                   lineStyle: {
                       color: '#ffffff'
                   }
               }
           },
           yAxis: {
               type: 'value',
               axisLabel: {
                   color: '#ffffff'
               },
               axisLine: {
                   lineStyle: {
                       color: '#ffffff'
                   }
               },
               splitLine: {
                   lineStyle: {
                       color: '#333333'
                   }
               }
           },
           series: data?.rows ? Object.keys(data.rows).map((row, index) => ({
               name: row,
               type: blueprint.type === 'vertical bars' ? 'bar' : 'line',
               data: data.rows[row] || [],
               itemStyle: {
                   color: blueprint.mainColor || '#5470c6'
               },
               emphasis: {
                   itemStyle: {
                       color: blueprint.mainColor || '#5470c6',
                       opacity: 0.8
                   }
               }
           })) : []
       }

       chart.setOption(option);
    }, [data]);


    return <div ref={chartContainerRef} className="w-[1000px] h-[700px]"></div>;
}