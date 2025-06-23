// Twitter Clean View - 内容脚本
// 处理动态加载的内容和高级功能

(function() {
    'use strict';
    
    console.log('Twitter Clean View 扩展已加载');
    
    // 配置选项
    const CONFIG = {
        // 是否启用调试模式
        DEBUG: false,
        
        // 需要隐藏的元素选择器（作为CSS的补充）
        HIDE_SELECTORS: [
            '[data-testid="sidebarColumn"]',
            '[aria-label*="推广"]',
            '[data-testid="promotedTweet"]',
            'aside[aria-label="关注推荐"]'
        ],
        
        // 监听变化的延迟时间（毫秒）
        OBSERVER_DELAY: 100
    };
    
    // 调试日志函数
    function debugLog(message, data = null) {
        if (CONFIG.DEBUG) {
            console.log(`[Twitter Clean View] ${message}`, data || '');
        }
    }
    
    // 隐藏指定选择器的元素
    function hideElements() {
        CONFIG.HIDE_SELECTORS.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element && element.style.display !== 'none') {
                    element.style.display = 'none';
                    debugLog(`隐藏元素: ${selector}`);
                }
            });
        });
    }
    
    // 优化推文显示
    function optimizeTweets() {
        const tweets = document.querySelectorAll('[data-testid="tweet"]');
        tweets.forEach(tweet => {
            // 确保推文有正确的样式类
            if (!tweet.classList.contains('clean-tweet')) {
                tweet.classList.add('clean-tweet');
                debugLog('优化推文显示');
            }
        });
    }
    
    // 调整页面布局
    function adjustLayout() {
        // 由于隐藏了右侧栏，调整主内容区域
        const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
        if (primaryColumn) {
            primaryColumn.style.maxWidth = '100%';
            primaryColumn.style.width = '100%';
            debugLog('调整主内容区域布局');
        }
        
        // 调整中心内容容器
        const centerContent = document.querySelector('main[role="main"]');
        if (centerContent) {
            centerContent.style.maxWidth = '800px';
            centerContent.style.margin = '0 auto';
            debugLog('调整中心内容容器');
        }
    }
    
    // 处理动态加载的内容
    function processNewContent() {
        hideElements();
        optimizeTweets();
        adjustLayout();
    }
    
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 创建观察器监听DOM变化
    function createObserver() {
        const debouncedProcess = debounce(processNewContent, CONFIG.OBSERVER_DELAY);
        
        const observer = new MutationObserver((mutations) => {
            let hasRelevantChanges = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // 检查是否有新的推文或相关内容添加
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.querySelector && (
                                node.querySelector('[data-testid="tweet"]') ||
                                node.querySelector('[data-testid="sidebarColumn"]') ||
                                node.matches('[data-testid="tweet"]') ||
                                node.matches('[data-testid="sidebarColumn"]')
                            )) {
                                hasRelevantChanges = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (hasRelevantChanges) {
                debugLog('检测到相关DOM变化，重新处理内容');
                debouncedProcess();
            }
        });
        
        // 开始观察
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        debugLog('DOM观察器已启动');
        return observer;
    }
    
    // 初始化函数
    function initialize() {
        debugLog('开始初始化 Twitter Clean View');
        
        // 等待页面基本加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    processNewContent();
                    createObserver();
                }, 500);
            });
        } else {
            // 页面已经加载完成
            setTimeout(() => {
                processNewContent();
                createObserver();
            }, 500);
        }
        
        // 监听页面URL变化（SPA路由）
        let currentUrl = location.href;
        const urlObserver = new MutationObserver(() => {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                debugLog('检测到URL变化', currentUrl);
                
                // URL变化后重新处理
                setTimeout(() => {
                    processNewContent();
                }, 1000);
            }
        });
        
        urlObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 添加自定义样式（作为CSS的补充）
    function addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 确保隐藏的元素不占用空间 */
            .twitter-clean-hidden {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* 自定义推文样式类 */
            .clean-tweet {
                transition: all 0.2s ease-in-out !important;
            }
        `;
        document.head.appendChild(style);
        debugLog('添加自定义样式');
    }
    
    // 启动扩展
    addCustomStyles();
    initialize();
    
    debugLog('Twitter Clean View 扩展初始化完成');
    
})(); 