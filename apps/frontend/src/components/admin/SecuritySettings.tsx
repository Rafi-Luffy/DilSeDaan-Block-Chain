import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TwoFactorSetup, TwoFactorVerification } from '@/components/auth/TwoFactorAuth';
import { Shield, Check, X, AlertTriangle, Key, Smartphone } from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [showSetup, setShowSetup] = useState<boolean>(false);
  const [showDisableModal, setShowDisableModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await api.twoFactor.getStatus();
      setTwoFactorEnabled(response.data.enabled);
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
      setError('Failed to load security settings');
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async (token: string) => {
    try {
      await api.twoFactor.disable(token);
      setTwoFactorEnabled(false);
      setShowDisableModal(false);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to disable 2FA');
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      const response = await api.twoFactor.regenerateBackupCodes('');
      // Handle backup codes display
      console.log('New backup codes:', response.data.backupCodes);
    } catch (error) {
      console.error('Failed to regenerate backup codes:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2">Loading security settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-600">Manage your account security and authentication methods</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium">Authenticator App</h3>
              <p className="text-sm text-gray-600 mt-1">
                Use an authenticator app to generate secure codes for login
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
                  {twoFactorEnabled ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-1" />
                      Disabled
                    </>
                  )}
                </Badge>
                {twoFactorEnabled && (
                  <Badge variant="outline" className="text-green-600">
                    Account Protected
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {twoFactorEnabled ? (
                <>
                  <Button
                    variant="outline"
                    onClick={regenerateBackupCodes}
                    className="flex items-center space-x-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Backup Codes</span>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDisableModal(true)}
                  >
                    Disable
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowSetup(true)}
                  className="flex items-center space-x-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Enable 2FA</span>
                </Button>
              )}
            </div>
          </div>

          {twoFactorEnabled && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Your account is protected</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Two-factor authentication is active. You'll need to enter a code from your 
                    authenticator app when logging in from new devices.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!twoFactorEnabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Enhance your security</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Enable two-factor authentication to add an extra layer of protection to your account.
                    This helps prevent unauthorized access even if your password is compromised.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Use a strong, unique password</h4>
                <p className="text-sm text-gray-600">
                  Choose a password that's at least 12 characters long and unique to this account.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Enable two-factor authentication</h4>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security by requiring a code from your phone.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Keep your backup codes safe</h4>
                <p className="text-sm text-gray-600">
                  Store your backup codes in a secure location where you can access them if needed.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Log out of public devices</h4>
                <p className="text-sm text-gray-600">
                  Always log out when using shared or public computers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Setup Two-Factor Authentication</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowSetup(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <TwoFactorSetup
                onComplete={() => {
                  setShowSetup(false);
                  setTwoFactorEnabled(true);
                  setError('');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Disable Two-Factor Authentication</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowDisableModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <TwoFactorVerification
                onSuccess={() => disableTwoFactor('')}
                onCancel={() => setShowDisableModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
