// 派车类型统计
const carTypeChartsOptions = (val1, val2) => {
  return {
    toolbox: {
      itemGap: 15,
      feature: {
        restore: {
          //重置
          show: true
        },
        saveAsImage: {
          //保存图片
          show: true
        }
      }
    },
    title: {
      text: "派车类型统计",
      left: "left",
      align: "left"
    },
    series: [
      {
        name: "审批派车次数",
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["25%", "60%"],
        radius: 100,
        axisLine: {
          lineStyle: {
            color: [
              [0.2, "#fefe00"],
              [0.8, "#49cb15"],
              [1, "#218AFF"]
            ],
            width: 30
          }
        },
        title: {
          //标题
          show: true,
          offsetCenter: [0, 66], // x, y，单位px
          textStyle: {
            color: "#000",
            fontSize: 14, //表盘上的标题文字大小
            fontWeight: 400,
            fontFamily: "PingFangSC"
          }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        },
        pointer: {
          length: "90px",
          width: "2px"
        },
        itemStyle: {
          color: "#F5BE40"
        },
        detail: {
          formatter: "{value}人次",
          fontStyle: "normal",
          fontFamily: "PingFangSC",
          fontSize: 18,
          color: "#000"
        },
        data: [
          {
            value: val1,
            name: "审批派车次数"
          }
        ]
      },
      {
        //指针内环
        type: "pie",
        hoverAnimation: false,
        legendHoverLink: false,
        radius: ["0%", "4%"],
        center: ["25%", "60%"],
        label: {
          normal: {
            show: false
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: [
          {
            value: 100,
            itemStyle: {
              normal: {
                color: "#F5BE40"
              }
            }
          }
        ]
      },
      {
        //指针内环
        type: "pie",
        hoverAnimation: false,
        legendHoverLink: false,
        radius: ["0%", "2%"],
        center: ["25%", "60%"],
        label: {
          normal: {
            show: false
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: [
          {
            value: 100,
            itemStyle: {
              normal: {
                color: "#fff"
              }
            }
          }
        ]
      },
      {
        name: "指定派车次数",
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["80%", "60%"],
        radius: 100,
        axisLine: {
          lineStyle: {
            color: [
              [0.2, "#fefe00"],
              [0.8, "#49cb15"],
              [1, "#218AFF"]
            ],
            width: 30
          }
        },
        title: {
          //标题
          show: true,
          offsetCenter: [0, 66], // x, y，单位px
          textStyle: {
            color: "#000",
            fontSize: 14, //表盘上的标题文字大小
            fontWeight: 400,
            fontFamily: "PingFangSC"
          }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        },
        pointer: {
          length: "90px",
          width: "2px"
        },
        itemStyle: {
          color: "#F5BE40"
        },
        detail: {
          formatter: "{value}人次",
          fontStyle: "normal",
          fontFamily: "PingFangSC",
          fontSize: 18,
          color: "#000"
        },
        data: [
          {
            value: val2,
            name: "指定派车次数"
          }
        ]
      },
      {
        //指针内环
        type: "pie",
        hoverAnimation: false,
        legendHoverLink: false,
        radius: ["0%", "4%"],
        center: ["80%", "60%"],
        label: {
          normal: {
            show: false
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: [
          {
            value: 100,
            itemStyle: {
              normal: {
                color: "#F5BE40"
              }
            }
          }
        ]
      },
      {
        //指针内环
        type: "pie",
        hoverAnimation: false,
        legendHoverLink: false,
        radius: ["0%", "2%"],
        center: ["80%", "60%"],
        label: {
          normal: {
            show: false
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: [
          {
            value: 100,
            itemStyle: {
              normal: {
                color: "#fff"
              }
            }
          }
        ]
      }
    ]
  };
};
//
const driverChartsOptions = data => {
  return {
    tooltip: {
      trigger: "axis"
    },
    color: ["#5AD8A6", "blue"],
    legend: {
      left: "10px",
      itemHeight: 4,
      itemWidth: 15,
      data: [
        {
          name: "行驶里程",
          icon: "rect"
        },
        {
          name: "出行次数",
          icon: "rect"
        }
      ]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.date
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: false
      }
    },
    series: [
      {
        name: "行驶里程",
        type: "line",
        stack: "行驶里程",
        data: data.sum_travel_mileage,
        symbol: "none",
        itemStyle: {
          normal: {
            lineStyle: {
              width: 3
            }
          }
        }
      },
      {
        name: "出行次数",
        type: "line",
        stack: "出行次数",
        symbol: "none",
        data: data.out_count,
        itemStyle: {
          normal: {
            lineStyle: {
              width: 3
            }
          }
        }
      }
    ]
  };
};
const carChartsOptions = data => {
  return {
    color: ["#749efb", "#70ddb4"],
    legend: {
      left: "10px",
      itemHeight: 15,
      itemWidth: 15,
      data: [
        {
          name: "行驶里程",
          icon: "rect"
        },
        {
          name: "出行次数",
          icon: "rect"
        }
      ]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    xAxis: [
      {
        type: "category",
        data: data.carNumber,
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0,
            end: 50
          },
          {
            type: "inside",
            realtime: true,
            start: 0,
            end: 50
          }
        ]
      }
    ],
    yAxis: {
      type: "value",
      axisLine: {
        show: false
      }
    },
    series: [
      {
        name: "行驶里程",
        type: "bar",
        barWidth: 30, //柱图宽度
        data: data.mileage
      },
      {
        name: "出行次数",
        type: "bar",
        barWidth: 30, //柱图宽度
        data: data.times
      }
    ]
  };
};
export { carTypeChartsOptions, carChartsOptions, driverChartsOptions };
