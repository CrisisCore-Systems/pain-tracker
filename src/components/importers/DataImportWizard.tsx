import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { AppleHealthChunkParser } from '../../services/importers/AppleHealthParser';
import { useHealthDataStore } from '../../stores/health-data-store';
import { Upload, FileCode, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { ImportResult } from '../../services/importers/types';

export const DataImportWizard: React.FC = () => {
    const [isParsing, setIsParsing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addRecords = useHealthDataStore(state => state.addRecords);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        setProgress(0);
        setResult(null);

        const parser = new AppleHealthChunkParser();
        
        try {
            const importResult = await parser.parse(file, (pct) => {
                setProgress(pct);
            });
            setResult(importResult);
        } catch (err) {
            console.error(err);
        } finally {
            setIsParsing(false);
        }
    };

    const handleCommit = () => {
        if (result?.records) {
            addRecords(result.records);
            // Reset
            setResult(null);
            setProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
            alert(`Successfully imported ${result.records.length} records!`);
        }
    };

    return (
        <Card className="max-w-xl mx-auto mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Health Data
                </CardTitle>
                <CardDescription>
                    Import your Apple Health export (export.xml) to correlate biological data with your pain logs.
                    Data is processed locally and encrypted on your device.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-5 text-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".xml" 
                        onChange={handleFileSelect}
                        className="hidden" 
                        id="health-file-upload"
                    />
                    <label 
                        htmlFor="health-file-upload" 
                        className="cursor-pointer flex flex-col items-center gap-2"
                    >
                        <FileCode className="h-8 w-8 text-primary opacity-50" />
                        <span className="text-sm font-medium">Click to select export.xml</span>
                        <span className="text-xs text-muted-foreground">Supports Apple Health XML exports</span>
                    </label>
                </div>

                {isParsing && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Processing...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
                            <div 
                                className="h-full bg-primary transition-all duration-200"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {result && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-100 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <h4 className="font-semibold text-green-800 dark:text-green-300">Analysis Complete</h4>
                        </div>
                        <ul className="text-sm space-y-1 text-green-700 dark:text-green-400 mb-4">
                            <li>Found {result.summary.totalRecords} valid records</li>
                            <li>Heart Rate, Sleep, Steps identified</li>
                        </ul>
                        <Button onClick={handleCommit} className="w-full">
                            Save to Encrypted Storage
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
