import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Smartphone, Copy, CheckCircle, AlertCircle, Key } from 'lucide-react';

interface TwoFactorSetupProps {
  onComplete: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [step, setStep] = useState<'setup' | 'verify' | 'backup' | 'complete'>('setup');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const setupTwoFactor = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.twoFactor.setup();
      setQrCode(response.data.qrCodeUrl);
      setSecret(response.data.secret);
      setBackupCodes(response.data.backupCodes);
      setStep('verify');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    setLoading(true);
    setError('');
    
    try {
      await api.twoFactor.enable(verificationCode);
      setStep('backup');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
  };

  const finishSetup = () => {
    setStep('complete');
    onComplete();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Two-Factor Authentication Setup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'setup' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Secure Your Account</h3>
            <p className="text-gray-600">
              Add an extra layer of security to your account by enabling two-factor authentication.
              This will require a code from your phone in addition to your password.
            </p>
            <Button onClick={setupTwoFactor} disabled={loading} className="w-full">
              {loading ? 'Setting up...' : 'Get Started'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <QRCodeSVG value={qrCode} size={200} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app such as Google Authenticator or Authy
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Manual Entry Key:</p>
                <div className="flex items-center space-x-2">
                  <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                    {secret}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(secret)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="verification-code">
                  Enter 6-digit code from your authenticator app
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg font-mono"
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={enableTwoFactor} 
                disabled={loading || verificationCode.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Save Your Backup Codes</h3>
              <p className="text-gray-600">
                Store these backup codes in a secure location. You can use them to access your account 
                if you lose your authenticator device.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Each backup code can only be used once. 
                Store them safely and treat them like passwords.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Backup Codes</span>
                <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                      {code}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={finishSetup} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Two-Factor Authentication Enabled</h3>
            <p className="text-gray-600">
              Your account is now protected with two-factor authentication. 
              You'll need to enter a code from your authenticator app when you log in.
            </p>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Account Secured
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface TwoFactorVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onSuccess,
  onCancel
}) => {
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [useBackupCode, setUseBackupCode] = useState<boolean>(false);

  const verifyCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      await api.twoFactor.verify(code);
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5" />
          <span>Two-Factor Authentication</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {useBackupCode 
              ? "Enter one of your backup codes" 
              : "Enter the 6-digit code from your authenticator app"
            }
          </p>
        </div>

        <div>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center text-lg font-mono"
            placeholder={useBackupCode ? "Backup code" : "123456"}
            maxLength={useBackupCode ? 10 : 6}
          />
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex space-x-3">
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={verifyCode} 
            disabled={isLoading || (useBackupCode ? code.length === 0 : code.length !== 6)}
            className="flex-1"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setUseBackupCode(!useBackupCode)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {useBackupCode ? 'Use authenticator app' : 'Use backup code'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
