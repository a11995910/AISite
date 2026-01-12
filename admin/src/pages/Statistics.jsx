import { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  DatePicker, 
  Table, 
  Typography, 
  Space,
  Spin
} from 'antd';
import ReactECharts from 'echarts-for-react';
import { getUsage, getTrends } from '../api/statistics';

const { Title } = Typography;
const { RangePicker } = DatePicker;

/**
 * 用量统计页面
 */
const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ userUsage: [], modelUsage: [] });
  const [trends, setTrends] = useState({ trends: [], typeDistribution: [] });
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const [usageRes, trendsRes] = await Promise.all([
        getUsage(params),
        getTrends({ days: 30 })
      ]);

      if (usageRes.code === 200) {
        setUsage(usageRes.data);
      }
      if (trendsRes.code === 200) {
        setTrends(trendsRes.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 模型使用占比饼图
  const modelPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '模型使用',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: usage.modelUsage.map(item => ({
          name: item.model?.name || '未知模型',
          value: parseInt(item.totalTokens) || 0
        }))
      }
    ]
  };

  // 使用类型饼图
  const typePieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0
    },
    series: [
      {
        name: '使用类型',
        type: 'pie',
        radius: '60%',
        center: ['50%', '45%'],
        data: trends.typeDistribution.map(item => ({
          name: item.type === 'chat' ? '对话' : '绘图',
          value: parseInt(item.tokens) || 0
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          color: (params) => {
            const colors = ['#1890ff', '#722ed1'];
            return colors[params.dataIndex % colors.length];
          }
        }
      }
    ]
  };

  // 趋势图配置
  const trendChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['Token消耗', '请求次数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trends.trends.map(item => item.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { color: '#666' }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Token',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      {
        type: 'value',
        name: '请求数',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Token消耗',
        type: 'bar',
        data: trends.trends.map(item => item.tokens || 0),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#1677ff' },
              { offset: 1, color: '#0958d9' }
            ]
          }
        }
      },
      {
        name: '请求次数',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: trends.trends.map(item => item.requests || 0),
        lineStyle: { color: '#52c41a', width: 2 },
        itemStyle: { color: '#52c41a' }
      }
    ]
  };

  // 用户排行表格列
  const userColumns = [
    {
      title: '排名',
      render: (_, __, index) => index + 1,
      width: 60
    },
    {
      title: '用户',
      dataIndex: ['user', 'name'],
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span>{text}</span>
          <span style={{ color: '#999', fontSize: 12 }}>{record.user?.username}</span>
        </Space>
      )
    },
    {
      title: '请求次数',
      dataIndex: 'requestCount',
      render: (val) => parseInt(val).toLocaleString()
    },
    {
      title: 'Token消耗',
      dataIndex: 'totalTokens',
      render: (val) => parseInt(val).toLocaleString()
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>用量统计</Title>
        <RangePicker 
          onChange={(dates) => setDateRange(dates)}
          placeholder={['开始日期', '结束日期']}
        />
      </div>

      {/* 趋势图 */}
      <Card 
        title="使用趋势（近30天）" 
        style={{ marginBottom: 16, borderRadius: 12 }}
      >
        <ReactECharts option={trendChartOption} style={{ height: 350 }} />
      </Card>

      <Row gutter={16}>
        {/* 模型使用占比 */}
        <Col xs={24} lg={12}>
          <Card 
            title="模型使用占比" 
            style={{ marginBottom: 16, borderRadius: 12 }}
          >
            <ReactECharts option={modelPieOption} style={{ height: 300 }} />
          </Card>
        </Col>

        {/* 使用类型 */}
        <Col xs={24} lg={12}>
          <Card 
            title="使用类型分布" 
            style={{ marginBottom: 16, borderRadius: 12 }}
          >
            <ReactECharts option={typePieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 用户排行 */}
      <Card title="用户Token消耗排行" style={{ borderRadius: 12 }}>
        <Table
          columns={userColumns}
          dataSource={usage.userUsage}
          rowKey={(record) => record.userId}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Statistics;
