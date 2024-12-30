"use client"

import React, {useEffect, useState} from 'react';
import {Copy, FileText, Loader2, RotateCcw, Save, Wand2} from 'lucide-react';
import {generateBlog} from "@/services/blogServices";
import {ContentType} from '@/types/blog';

const BlogAI = () => {
    const [draft, setDraft] = useState('');
    const [expandedText, setExpandedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [contentType, setContentType] = useState<ContentType>(ContentType.RESTAURANT);
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
        if (!draft.trim() || !contentType) return;

        setIsGenerating(true);
        setTypingText('');
        setError(null); // 에러 상태 초기화

        try {
            const response = await generateBlog({
                draft,
                contentType,
            });

            setExpandedText(response.text);
        } catch (error) {
            console.error('Error:', error);
            setError('블로그 글 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatBlogContent = (content: string) => {
        content = content.trim();
        const sections = content.split('\n\n');

        return sections.map((section, idx) => {
            // Headers (h1-h6)
            if (section.match(/^#{1,6}\s/)) {
                const level = (section.match(/^#+/) || [''])[0].length as number;
                const text = section.replace(/^#+\s/, '');
                const sizes: Record<number, string> = {
                    1: 'text-4xl',
                    2: 'text-3xl',
                    3: 'text-2xl',
                    4: 'text-xl',
                    5: 'text-lg',
                    6: 'text-base'
                };
                return React.createElement(`h${level}`, {
                    key: idx,
                    className: `${sizes[level]} font-bold text-gray-800 mt-6 mb-3`
                }, text);
            }

            // Blockquotes
            if (section.startsWith('>')) {
                return (
                    <blockquote key={idx} className="pl-4 border-l-4 border-gray-300 text-gray-600 italic my-4">
                        {section.replace(/^>\s?/gm, '')}
                    </blockquote>
                );
            }

            // Code blocks
            if (section.startsWith('```')) {
                const code = section.replace(/```(\w+)?\n?/g, '');
                return (
                    <pre key={idx} className="bg-gray-50 rounded-lg p-4 overflow-x-auto my-4">
                    <code className="text-sm text-gray-800">{code}</code>
                </pre>
                );
            }

            // Lists
            if (section.match(/^(\d+\.|[-*+])\s/m)) {
                const items = section.split('\n').filter(item => item.trim());
                const isOrdered = /^\d+\./.test(items[0]);
                const ListComponent = isOrdered ? 'ol' : 'ul';
                const listClass = isOrdered ? 'list-decimal' : 'list-disc';

                return (
                    <ListComponent key={idx} className={`${listClass} pl-6 my-4 space-y-2`}>
                        {items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-gray-700">
                                {item.replace(/^(\d+\.|[-*+])\s/, '')}
                            </li>
                        ))}
                    </ListComponent>
                );
            }

            // Bold, italic, inline code, links
            if (section.match(/[*_`\[\]]/)) {
                const formattedText = section.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?]\(.*?\))/g).map((part, partIdx) => {
                    // Bold text (handles **text**)
                    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
                    if (boldMatch) {
                        return <strong key={partIdx} className="font-bold">{boldMatch[1]}</strong>;
                    }

                    // Rest of the conditions remain the same
                    if (part.match(/^\*(.*?)\*$/)) {
                        return <em key={partIdx} className="italic">{part.replace(/\*/g, '')}</em>;
                    }
                    if (part.match(/^`(.*?)`$/)) {
                        return <code key={partIdx} className="bg-gray-100 px-1 rounded">{part.replace(/`/g, '')}</code>;
                    }
                    if (part.match(/^\[(.*?)]\((.*?)\)$/)) {
                        const [, text, url] = part.match(/^\[(.*?)]\((.*?)\)$/) || [];
                        return <a key={partIdx} href={url} className="text-blue-600 hover:underline">{text}</a>;
                    }
                    return part;
                });
                return <p key={idx} className="text-gray-700 leading-relaxed mb-4">{formattedText}</p>;
            }

            // Hashtags
            if (section.includes('#')) {
                const tags = section.match(/#[\wㄱ-ㅎㅏ-ㅣ가-힣]+/g) || [];
                const tagElements = tags.map((tag, tagIdx) => (
                    <span key={tagIdx} className="inline-block bg-blue-100 text-blue-600 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                    {tag}
                </span>
                ));
                return <div key={idx} className="my-4">{tagElements}</div>;
            }

            // Regular paragraphs
            return (
                <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                    {section}
                </p>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
            {/* 헤더 */}
            <header className="max-w-6xl mx-auto mb-6 flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
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
                            onClick={() => setContentType(ContentType.RESTAURANT)}
                            className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all border ${
                                contentType === ContentType.RESTAURANT
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent'
                            }`}
                        >
                            <Wand2 className="w-5 h-5"/>
                            <span className="text-sm font-medium">맛집</span>
                        </button>
                        <button
                            onClick={() => setContentType(ContentType.PROGRAMMING)}
                            className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all border ${
                                contentType === ContentType.PROGRAMMING
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent'
                            }`}
                        >
                            <FileText className="w-5 h-5"/>
                            <span className="text-sm font-medium">개발</span>
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
                                <RotateCcw className="w-4 h-4"/>
                                <span>초기화</span>
                            </button>
                            <button
                                onClick={() => navigator.clipboard.writeText(draft)}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                            >
                                <Copy className="w-4 h-4"/>
                                <span>복사하기</span>
                            </button>
                            <button
                                onClick={() => {/* 저장 로직 */
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                            >
                                <Save className="w-4 h-4"/>
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
                                    <Loader2 className="w-5 h-5 animate-spin"/>
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

                    <div
                        className="h-[calc(100vh-400px)] min-h-[300px] overflow-auto p-4 rounded-xl bg-gradient-to-b from-blue-50 to-white border border-blue-100">
                        {isGenerating ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Loader2 className="w-5 h-5 animate-spin"/>
                                    <span>블로그 글을 생성하고 있습니다...</span>
                                </div>
                            </div>
                        ) : typingText ? (
                            <div className="p-6">
                                <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-blue-700 font-medium mb-4">생성된 블로그 글</h3>
                                    <article className="space-y-4">
                                        {formatBlogContent(typingText)}
                                    </article>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(typingText)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                                    >
                                        <Copy className="w-4 h-4" />
                                        <span>복사하기</span>
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>다시 생성하기</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-500 font-bold text-xl">b</span>
                                </div>
                                <p>초안을 작성하고 &apos;블로그 글 확장하기&apos; 버튼을 클릭해주세요.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogAI;