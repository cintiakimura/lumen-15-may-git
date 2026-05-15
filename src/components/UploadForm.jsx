import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { lumen } from '@/api/lumenClient';

export default function UploadForm({ onCourseCreated, onClose }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    content: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedLessons, setGeneratedLessons] = useState(null);
  const [error, setError] = useState('');
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    if (droppedFile) {
      if (droppedFile.size > MAX_FILE_SIZE) {
        setError(`File size exceeds 50MB limit (${(droppedFile.size / 1024 / 1024).toFixed(1)}MB). Please use a smaller file.`);
        return;
      }
      setFile(droppedFile);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setCourseData(prev => ({ ...prev, content }));
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
      };
      reader.readAsText(droppedFile);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processContent = async () => {
    if (!courseData.title || (!courseData.content && !file)) {
      setError('Please provide a title and content');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await lumen.functions.invoke('structureCourse', {
        content: courseData.content,
        title: courseData.title
      });

      if (response.data.success) {
        setGeneratedLessons({ lessons: response.data.lessons });
        setStep(2);
      } else {
        setError('Failed to process content. Please try again.');
      }
    } catch (err) {
      setError('Failed to process content. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveCourse = async () => {
    try {
      const user = await lumen.auth.me();
      await lumen.entities.Course.create({
        title: courseData.title,
        description: courseData.description || '',
        content: courseData.content,
        lessons: generatedLessons.lessons,
        category: 'other',
        thumbnail: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400`,
        teacher_id: user.id,
        is_published: true
      });
      
      onCourseCreated?.();
    } catch (err) {
      setError('Failed to save course. Please try again.');
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {step === 1 ? 'Upload Course Content' : 'Review Generated Lessons'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {step === 1 
                ? 'Upload a file or paste your content' 
                : 'Grok has structured your content into lessons'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Course Title *
                  </label>
                  <Input
                    value={courseData.title}
                    onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Advanced Brake Systems"
                    className="py-3"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={courseData.description}
                    onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what students will learn..."
                    rows={2}
                  />
                </div>



                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Content *
                  </label>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-xs text-amber-800">
                      ⚠️ <strong>Privacy Notice:</strong> Links and hyperlinks in your content will be ignored for privacy. Upload plain text if possible.
                    </p>
                  </div>
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                      file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    )}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleFileDrop}
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <div className="text-left">
                          <p className="font-medium text-slate-800">{file.name}</p>
                          <p className="text-sm text-slate-500">
                            {file.size > 1024 * 1024 
                              ? `${(file.size / 1024 / 1024).toFixed(1)} MB` 
                              : `${(file.size / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setCourseData(prev => ({ ...prev, content: '' }));
                            setError('');
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="font-medium text-slate-700">Drop your file here</p>
                        <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                        <p className="text-xs text-slate-400 mt-2">Supports PDF, TXT, DOC (up to 50MB)</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Or paste content */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-3 text-slate-500">or paste content</span>
                  </div>
                </div>

                <Textarea
                  value={courseData.content}
                  onChange={(e) => setCourseData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Paste your course content here..."
                  rows={6}
                  className="font-mono text-sm"
                />

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {generatedLessons?.summary && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800">{generatedLessons.summary}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {generatedLessons?.lessons?.map((lesson, index) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-50 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{lesson.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="capitalize">{lesson.format}</span>
                            <span>•</span>
                            <span>{lesson.duration} min</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {lesson.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          
          {step === 1 ? (
            <Button
              onClick={processContent}
              disabled={isProcessing || !courseData.title || !courseData.content}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing with Grok...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Lessons
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={saveCourse}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Course
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}