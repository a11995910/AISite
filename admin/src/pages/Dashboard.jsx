import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import {
  UserOutlined,
  ApiOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  CodeOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getOverview, getTrends } from '../api/statistics';

const { Title } = Typography;

/**
 * 仪表盘页面
 * 展示系统概览数据和趋势图表
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({});
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, trendsRes] = await Promise.all([
        getOverview(),
        getTrends({ days: 7 })
      ]);
      
      if (overviewRes.code === 200) {
        setOverview(overviewRes.data);
      }
      if (trendsRes.code === 200) {
        setTrends(trendsRes.data.trends || []);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 统计卡片配置
  const statCards = [
    {
      title: '活跃用户',
      value: overview.totalUsers || 0,
      icon: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: '模型数量',
      value: overview.totalModels || 0,
      icon: <ApiOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Agent数量',
      value: overview.totalAgents || 0,
      icon: <RobotOutlined />,
      color: '#722ed1'
    },
    {
      title: '今日Token',
      value: overview.todayTokens || 0,
      icon: <ThunderboltOutlined />,
      color: '#fa8c16'
    },
    {
      title: 'SDK Token消耗',
      value: overview.sdkTokens || 0,
      icon: <CodeOutlined />,
      color: '#eb2f96'
    }
  ];

  // 趋势图表配置
  const trendChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trends.map(item => item.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#666' }
    },
    series: [
      {
        name: 'Token消耗',
        type: 'bar',
        data: trends.map(item => item.tokens || 0),
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
      }
    ]
  };

  // 请求趋势图表
  const requestChartOption = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trends.map(item => item.date),
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#666' }
    },
    series: [
      {
        name: '请求次数',
        type: 'line',
        smooth: true,
        data: trends.map(item => item.requests || 0),
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ]
          }
        },
        lineStyle: { color: '#1890ff', width: 2 },
        itemStyle: { color: '#1890ff' }
      }
    ]
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>系统概览</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card 
              hoverable
              style={{ 
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  valueStyle={{ color: stat.color }}
                />
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  color: stat.color
                }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="Token消耗趋势" 
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: '12px 24px' } }}
          >
            <ReactECharts 
              option={trendChartOption} 
              style={{ height: 300 }} 
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="请求次数趋势" 
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: '12px 24px' } }}
          >
            <ReactECharts 
              option={requestChartOption} 
              style={{ height: 300 }} 
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
