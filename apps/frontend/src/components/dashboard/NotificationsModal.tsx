import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, CheckCircle, AlertCircle, Clock, Heart, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose
}) => {
  const notifications = [
    {
      id: 1,
      type: 'donation',
      icon: Heart,
      title: 'Donation Successful',
      message: 'Your donation of ₹5,000 to "Education for All" has been processed successfully.',
      time: '2 hours ago',
      status: 'unread',
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'reminder',
      icon: Clock,
      title: 'Monthly Donation Reminder',
      message: 'You haven\'t made a donation this month. Consider supporting a cause close to your heart.',
      time: '1 day ago',
      status: 'unread',
      color: 'text-orange-600'
    },
    {
      id: 3,
      type: 'update',
      icon: CheckCircle,
      title: 'Campaign Update',
      message: 'The "Clean Water Initiative" campaign you supported has reached 75% of its goal!',
      time: '3 days ago',
      status: 'read',
      color: 'text-blue-600'
    },
    {
      id: 4,
      type: 'achievement',
      icon: DollarSign,
      title: 'Achievement Unlocked',
      message: 'Congratulations! You\'ve earned the "Consistent Giver" badge for donating 6 months in a row.',
      time: '1 week ago',
      status: 'read',
      color: 'text-purple-600'
    }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-xl max-h-[80vh] overflow-hidden"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b">
              <CardTitle className="flex items-center gap-2 text-warm-charcoal">
                <Bell className="h-5 w-5 text-warm-orange" />
                Notifications
                <Badge variant="secondary" className="bg-warm-orange text-white">
                  {notifications.filter(n => n.status === 'unread').length}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-warm-cream/20 transition-colors ${
                      notification.status === 'unread' ? 'bg-warm-cream/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        <notification.icon className={`h-4 w-4 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-warm-charcoal truncate">
                            {notification.title}
                          </h4>
                          {notification.status === 'unread' && (
                            <div className="w-2 h-2 bg-warm-orange rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-xs text-warm-charcoal/70 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-warm-charcoal/50 mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
                >
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
                >
                  Settings
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
