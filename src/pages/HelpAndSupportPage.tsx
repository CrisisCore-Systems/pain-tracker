import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../design-system';
import { BookOpen, HelpCircle, LifeBuoy } from 'lucide-react';

export default function HelpAndSupportPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Help & Support</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Getting started</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Learn how to track your pain and use the app features.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">View tutorials</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <CardTitle>FAQs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Find answers to common questions about the app.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Browse FAQs</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <LifeBuoy className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Contact Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">If you need help, contact our support team for assistance.</p>
            <div className="mt-3">
              <Button variant="default" size="sm">Contact support</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
