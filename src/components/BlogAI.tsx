"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, Type, Wand2, FileText, RotateCcw, Copy, Save } from 'lucide-react';
import {generateBlog} from "@/services/blogServices";

const BlogAI = () => {
    const [draft, setDraft] = useState('');
    const [expandedText, setExpandedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [expandType, setExpandType] = useState('detailed');
    const [wordCount, setWordCount] = useState(0);
    const [error, setError] = useState<string | null>(null);  // 에러 상태 추가


    useEffect(() => {
        if (draft) {
            setWordCount(draft.trim().split(/\s+/).length);
        } else {
            setWordCount(0);
        }
    }, [draft]);

    useEffect(() => {
        if (expandedText && !isGenerating) {
            let index = 0;
            setTypingText('');
            const timer = setInterval(() => {
                if (index < expandedText.length) {
                    setTypingText(prev => prev + expandedText[index]);
                    index++;
                } else {
                    clearInterval(timer);
                }
            }, 20);
            return () => clearInterval(timer);
        }
    }, [expandedText, isGenerating]);

    const handleGenerate = async () => {
        if (!draft.trim()) return;

        setIsGenerating(true);
        setTypingText('');
        setError(null); // 에러 상태 초기화

        try {
            const response = await generateBlog({
                draft,
                type: expandType,
            });

            setExpandedText(response.text);
        } catch (error) {
            console.error('Error:', error);
            setError('블로그 글 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
            {/* 헤더 */}
            <header className="max-w-6xl mx-auto mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">b</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        blog.AI
                    </h1>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
            Beta
          </span>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 왼쪽: 초안 입력 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            블로그 초안 작성
                        </h2>
                        <p className="text-gray-600 text-sm">
                            초안을 입력하시면 AI가 전문적인 블로그 글로 확장해드립니다.
                        </p>
                    </div>

                    {/* 확장 스타일 선택 */}
                    <div className="mb-4 grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setExpandType('detailed')}
                            className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all border ${
                                expandType === 'detailed'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent'
                            }`}
                        >
                            <Type className="w-5 h-5" />
                            <span className="text-sm font-medium">상세 설명</span>
                        </button>
                        <button
                            onClick={() => setExpandType('creative')}
                            className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all border ${
                                expandType === 'creative'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent'
                            }`}
                        >
                            <Wand2 className="w-5 h-5" />
                            <span className="text-sm font-medium">창의적 확장</span>
                        </button>
                        <button
                            onClick={() => setExpandType('concise')}
                            className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all border ${
                                expandType === 'concise'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent'
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-medium">간단 요약</span>
                        </button>
                    </div>

                    {/* 텍스트 에디터 */}
                    <div className="relative">
            <textarea
                className="w-full h-[calc(100vh-520px)] min-h-[200px] p-4 text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                placeholder="예: Spring Boot의 기본 개념에 대해 설명해주세요."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
            />
                        <div className="absolute bottom-2 right-2 text-sm text-gray-500">
                            {wordCount}자
                        </div>
                    </div>

                    {/* 하단 도구 모음 */}
                    <div className="mt-4 flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setDraft('')}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 border border-gray-200"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>초기화</span>
                            </button>
                            <button
                                onClick={() => navigator.clipboard.writeText(draft)}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                            >
                                <Copy className="w-4 h-4" />
                                <span>복사하기</span>
                            </button>
                            <button
                                onClick={() => {/* 저장 로직 */}}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                            >
                                <Save className="w-4 h-4" />
                                <span>저장하기</span>
                            </button>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!draft.trim() || isGenerating}
                            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 hover:shadow-md active:scale-95"
                        >
                            {isGenerating ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>생성 중...</span>
                                </div>
                            ) : (
                                "블로그 글 확장하기"
                            )}
                        </button>

                        {/* 에러 메시지 표시 */}
                        {error && (
                            <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* 오른쪽: 결과 출력 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            AI 블로그 글 결과
                        </h2>
                        <p className="text-gray-600 text-sm">
                            전문적이고 매력적인 블로그 글이 생성됩니다.
                        </p>
                    </div>

                    <div className="h-[calc(100vh-400px)] min-h-[300px] overflow-auto p-4 rounded-xl bg-gradient-to-b from-blue-50 to-white border border-blue-100">
                        {isGenerating ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>블로그 글을 생성하고 있습니다...</span>
                                </div>
                            </div>
                        ) : typingText ? (
                            <>
                                <div className="prose prose-sm">
                                    <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
                                        <strong className="text-blue-700">초안</strong>
                                        <p className="mt-1">{draft}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                                        <strong className="text-blue-700">완성된 블로그</strong>
                                        <p className="mt-1 leading-relaxed">{typingText}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-md active:scale-95"
                                >
                                    다시 생성하기
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-500 font-bold text-xl">b</span>
                                </div>
                                <p>초안을 작성하고 '블로그 글 확장하기' 버튼을 클릭해주세요.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogAI;