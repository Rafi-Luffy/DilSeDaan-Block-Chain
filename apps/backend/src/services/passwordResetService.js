const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class PasswordResetService {
    constructor() {
        this.resetTokens = new Map(); // In production, use Redis
        this.resetAttempts = new Map(); // Track reset attempts per IP/email
        this.maxAttemptsPerHour = 3;
        this.tokenExpiryMinutes = 30;
    }

    generateResetToken(userId, email) {
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + this.tokenExpiryMinutes * 60 * 1000);
        
        this.resetTokens.set(hashedToken, {
            userId,
            email,
            expiresAt,
            used: false,
            createdAt: new Date()
        });
        
        return token; // Return unhashed token for email
    }

    async validateResetToken(token) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const resetData = this.resetTokens.get(hashedToken);
        
        if (!resetData) {
            return {
                valid: false,
                message: 'Invalid or expired reset token'
            };
        }
        
        if (new Date() > resetData.expiresAt) {
            this.resetTokens.delete(hashedToken);
            return {
                valid: false,
                message: 'Reset token has expired. Please request a new one.'
            };
        }
        
        if (resetData.used) {
            return {
                valid: false,
                message: 'Reset token has already been used'
            };
        }
        
        return {
            valid: true,
            userId: resetData.userId,
            email: resetData.email
        };
    }

    async resetPassword(token, newPassword, confirmPassword) {
        try {
            // Validate passwords match
            if (newPassword !== confirmPassword) {
                return {
                    success: false,
                    message: 'Passwords do not match'
                };
            }
            
            // Validate password strength
            const passwordValidation = this.validatePasswordStrength(newPassword);
            if (!passwordValidation.isValid) {
                return {
                    success: false,
                    message: 'Password does not meet security requirements',
                    requirements: passwordValidation.requirements
                };
            }
            
            // Validate token
            const tokenValidation = await this.validateResetToken(token);
            if (!tokenValidation.valid) {
                return {
                    success: false,
                    message: tokenValidation.message
                };
            }
            
            // Hash new password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            
            // Mark token as used
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            const resetData = this.resetTokens.get(hashedToken);
            resetData.used = true;
            
            return {
                success: true,
                userId: tokenValidation.userId,
                hashedPassword,
                message: 'Password reset successfully'
            };
            
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                message: 'An error occurred while resetting password'
            };
        }
    }

    validatePasswordStrength(password) {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            notCommon: !this.isCommonPassword(password)
        };
        
        const isValid = Object.values(requirements).every(req => req === true);
        
        return {
            isValid,
            requirements: {
                'At least 8 characters': requirements.minLength,
                'One uppercase letter': requirements.hasUppercase,
                'One lowercase letter': requirements.hasLowercase,
                'One number': requirements.hasNumbers,
                'One special character': requirements.hasSpecialChars,
                'Not a common password': requirements.notCommon
            }
        };
    }

    isCommonPassword(password) {
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey',
            '1234567890', 'password1', '123123', 'admin123'
        ];
        
        return commonPasswords.includes(password.toLowerCase());
    }

    checkResetAttempts(identifier) {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        
        if (!this.resetAttempts.has(identifier)) {
            this.resetAttempts.set(identifier, []);
        }
        
        const attempts = this.resetAttempts.get(identifier);
        
        // Remove attempts older than 1 hour
        const recentAttempts = attempts.filter(attempt => attempt > oneHourAgo);
        this.resetAttempts.set(identifier, recentAttempts);
        
        return {
            count: recentAttempts.length,
            allowed: recentAttempts.length < this.maxAttemptsPerHour,
            nextAllowedAt: recentAttempts.length >= this.maxAttemptsPerHour 
                ? new Date(recentAttempts[0].getTime() + 60 * 60 * 1000)
                : null
        };
    }

    recordResetAttempt(identifier) {
        if (!this.resetAttempts.has(identifier)) {
            this.resetAttempts.set(identifier, []);
        }
        
        this.resetAttempts.get(identifier).push(new Date());
    }

    generateSecureResetCode() {
        // Generate a 6-digit secure code
        const code = crypto.randomInt(100000, 999999).toString();
        return code;
    }

    async createPasswordResetRequest(user, clientIp) {
        try {
            // Check rate limiting
            const identifier = `${user.email}_${clientIp}`;
            const attemptCheck = this.checkResetAttempts(identifier);
            
            if (!attemptCheck.allowed) {
                return {
                    success: false,
                    message: `Too many reset attempts. Try again after ${attemptCheck.nextAllowedAt.toLocaleTimeString()}`,
                    retryAfter: attemptCheck.nextAllowedAt
                };
            }
            
            // Generate tokens
            const resetToken = this.generateResetToken(user._id, user.email);
            const resetCode = this.generateSecureResetCode();
            
            // Store code separately for verification
            this.resetTokens.set(`code_${user._id}`, {
                code: resetCode,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes for code
                attempts: 0,
                maxAttempts: 3
            });
            
            // Record attempt
            this.recordResetAttempt(identifier);
            
            return {
                success: true,
                resetToken,
                resetCode,
                expiresIn: `${this.tokenExpiryMinutes} minutes`,
                message: 'Password reset request created successfully'
            };
            
        } catch (error) {
            console.error('Create reset request error:', error);
            throw new Error('Failed to create password reset request');
        }
    }

    async verifyResetCode(userId, code) {
        try {
            const codeData = this.resetTokens.get(`code_${userId}`);
            
            if (!codeData) {
                return {
                    success: false,
                    message: 'No reset code found. Please request a new password reset.'
                };
            }
            
            if (new Date() > codeData.expiresAt) {
                this.resetTokens.delete(`code_${userId}`);
                return {
                    success: false,
                    message: 'Reset code expired. Please request a new one.'
                };
            }
            
            if (codeData.attempts >= codeData.maxAttempts) {
                this.resetTokens.delete(`code_${userId}`);
                return {
                    success: false,
                    message: 'Too many failed attempts. Please request a new reset code.'
                };
            }
            
            if (codeData.code !== code) {
                codeData.attempts++;
                return {
                    success: false,
                    message: `Invalid reset code. ${codeData.maxAttempts - codeData.attempts} attempts remaining.`
                };
            }
            
            // Success - cleanup code
            this.resetTokens.delete(`code_${userId}`);
            
            return {
                success: true,
                message: 'Reset code verified successfully!'
            };
            
        } catch (error) {
            console.error('Reset code verification error:', error);
            throw new Error('Failed to verify reset code');
        }
    }

    // Cleanup expired tokens (run periodically)
    cleanupExpiredTokens() {
        const now = new Date();
        
        for (const [key, data] of this.resetTokens.entries()) {
            if (now > data.expiresAt) {
                this.resetTokens.delete(key);
            }
        }
        
        // Cleanup old attempts
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        for (const [identifier, attempts] of this.resetAttempts.entries()) {
            const recentAttempts = attempts.filter(attempt => attempt > oneHourAgo);
            if (recentAttempts.length === 0) {
                this.resetAttempts.delete(identifier);
            } else {
                this.resetAttempts.set(identifier, recentAttempts);
            }
        }
    }

    // Get reset statistics
    getResetStats() {
        const stats = {
            totalTokens: 0,
            activeTokens: 0,
            expiredTokens: 0,
            usedTokens: 0,
            totalAttempts: 0
        };
        
        const now = new Date();
        
        for (const [key, data] of this.resetTokens.entries()) {
            if (key.startsWith('code_')) continue; // Skip code entries
            
            stats.totalTokens++;
            
            if (data.used) {
                stats.usedTokens++;
            } else if (now > data.expiresAt) {
                stats.expiredTokens++;
            } else {
                stats.activeTokens++;
            }
        }
        
        // Count attempts
        for (const attempts of this.resetAttempts.values()) {
            stats.totalAttempts += attempts.length;
        }
        
        return stats;
    }
}

module.exports = PasswordResetService;
