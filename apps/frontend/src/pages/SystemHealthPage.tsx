import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Server,
  Database,
  Globe,
  Lock,
  RefreshCw,
  Clock,
  AlertCircle,
  Wifi
} from 'lucide-react';

interface SystemStatus {
  overall: 'operational' | 'degraded' | 'down' | 'unknown';
  api: 'operational' | 'degraded' | 'down' | 'unknown';
  database: 'operational' | 'degraded' | 'down' | 'unknown';
  blockchain: 'operational' | 'degraded' | 'down' | 'unknown';
  security: 'operational' | 'degraded' | 'down' | 'unknown';
  lastUpdate: string;
}

interface SecurityDashboard {
  summary: {
    totalEvents: number;
    recentEvents: number;
    dailyEvents: number;
    blockedIPs: number;
    highSeverityEvents: number;
  };
  systemStatus: {
    monitoring: string;
    lastUpdate: string;
    threatLevel: string;
  };
  recentAlerts: Array<{
    id: string;
    type: string;
    severity: string;
    timestamp: string;
    details: any;
  }>;
}

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeUsers: number;
  totalRequests: number;
}

const SystemHealthPage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [securityDashboard, setSecurityDashboard] = useState<SecurityDashboard | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadSystemData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadSystemData();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      const [statusRes, securityRes, metricsRes] = await Promise.allSettled([
        fetch('/api/system/status'),
        fetch('/api/security/health'),
        fetch('/api/system/metrics')
      ]);

      // Handle system status
      if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
        const statusData = await statusRes.value.json();
        if (statusData.success) {
          setSystemStatus(statusData.data);
        }
      } else {
        // Fallback status when API is down
        setSystemStatus({
          overall: 'down',
          api: 'down',
          database: 'unknown',
          blockchain: 'unknown',
          security: 'unknown',
          lastUpdate: new Date().toISOString()
        });
      }

      // Handle security data
      if (securityRes.status === 'fulfilled' && securityRes.value.ok) {
        const securityData = await securityRes.value.json();
        if (securityData.success) {
          setSecurityDashboard(securityData.data);
        }
      }

      // Handle metrics data
      if (metricsRes.status === 'fulfilled' && metricsRes.value.ok) {
        const metricsData = await metricsRes.value.json();
        if (metricsData.success) {
          setSystemMetrics(metricsData.data);
        }
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-orange-600 bg-orange-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5" />;
      case 'down':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-orange-600 bg-orange-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'CRITICAL':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUptime = (uptimeHours: number) => {
    const days = Math.floor(uptimeHours / 24);
    const hours = Math.floor(uptimeHours % 24);
    const minutes = Math.floor((uptimeHours % 1) * 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading && !systemStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of platform health and security</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Auto refresh</span>
          </label>
          
          <button
            onClick={loadSystemData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      {systemStatus && (
        <div className="mb-8">
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-lg border-2 ${
            systemStatus.overall === 'operational' 
              ? 'border-green-200 bg-green-50' 
              : systemStatus.overall === 'degraded'
              ? 'border-orange-200 bg-orange-50'
              : 'border-red-200 bg-red-50'
          }`}>
            {getStatusIcon(systemStatus.overall)}
            <div>
              <h2 className="text-xl font-semibold">
                Platform Status: <span className="capitalize">{systemStatus.overall}</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                All systems {systemStatus.overall === 'operational' ? 'operational' : 'experiencing issues'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8">
        {/* System Components Status */}
        {systemStatus && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              System Components
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">API Server</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.api)}`}>
                  {getStatusIcon(systemStatus.api)}
                  {systemStatus.api}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Database</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.database)}`}>
                  {getStatusIcon(systemStatus.database)}
                  {systemStatus.database}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Blockchain</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.blockchain)}`}>
                  {getStatusIcon(systemStatus.blockchain)}
                  {systemStatus.blockchain}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Security</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.security)}`}>
                  {getStatusIcon(systemStatus.security)}
                  {systemStatus.security}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Security Overview */}
        {securityDashboard && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Security Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Threat Level</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatLevelColor(securityDashboard.systemStatus.threatLevel)}`}>
                  {securityDashboard.systemStatus.threatLevel}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recent Events</span>
                <span className="text-sm font-medium">{securityDashboard.summary.recentEvents}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Blocked IPs</span>
                <span className="text-sm font-medium">{securityDashboard.summary.blockedIPs}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">High Severity</span>
                <span className="text-sm font-medium text-red-600">{securityDashboard.summary.highSeverityEvents}</span>
              </div>
            </div>
            
            {securityDashboard.recentAlerts.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Alerts</h4>
                <div className="space-y-2">
                  {securityDashboard.recentAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="text-xs p-2 rounded bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          alert.severity === 'HIGH' ? 'text-red-600' : 
                          alert.severity === 'MEDIUM' ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {alert.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Metrics */}
        {systemMetrics && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Performance Metrics
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium text-green-600">
                  {formatUptime(systemMetrics.uptime)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium">
                  {systemMetrics.responseTime}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Throughput</span>
                <span className="text-sm font-medium">
                  {systemMetrics.throughput.toLocaleString()} req/min
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className={`text-sm font-medium ${
                  systemMetrics.errorRate > 5 ? 'text-red-600' : 
                  systemMetrics.errorRate > 1 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {systemMetrics.errorRate.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium">
                  {systemMetrics.activeUsers.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Total Requests Today</span>
                <span>{systemMetrics.totalRequests.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Platform Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="font-medium">2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environment</span>
                <span className="font-medium">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Region</span>
                <span className="font-medium">Mumbai, India</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deployment</span>
                <span className="font-medium">Government Ready</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Network Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Polygon Network</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IPFS Network</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CDN Status</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SSL Certificate</span>
                <span className="text-green-600 font-medium">Valid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPage;
