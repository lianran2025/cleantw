// Twitter Clean View - 内容脚本
// 处理动态加载的内容和高级功能

(function() {
    'use strict';
    
    console.log('Twitter Clean View 扩展已加载');
    
    // 配置选项
    let CONFIG = {
        // 是否启用调试模式
        DEBUG: false,
        
        // 扩展是否启用
        ENABLED: true,
        
        // 需要隐藏的元素选择器（作为CSS的补充）
        HIDE_SELECTORS: [
            '[data-testid="sidebarColumn"]',
            '[aria-label*="推广"]',
            '[data-testid="promotedTweet"]',
            'aside[aria-label="关注推荐"]',
            // 完全隐藏左侧导航栏
            'header[role="banner"]',
            'nav[aria-label="主要"]',
            // 隐藏「为你推荐」标签页
            'div[aria-label="时间线：推荐"]',
            'div[aria-label="时间线：For you"]',
            // 隐藏「发现更多」模块
            '[aria-label="发现更多推文"]',
            '[aria-label="Discover more tweets"]'
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
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element && element.style.display !== 'none') {
                        element.style.display = 'none';
                        element.style.width = '0';
                        element.style.minWidth = '0';
                        debugLog(`隐藏元素: ${selector}`);
                    }
                });
            } catch (error) {
                if (CONFIG.DEBUG) {
                    console.warn(`[Twitter Clean View] 隐藏元素时出错: ${selector}`, error);
                }
            }
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
            
            // 处理图片智能预览
            optimizeImages(tweet);
        });
    }
    
    // 图片智能预览功能
    function optimizeImages(tweetElement) {
        try {
            const images = tweetElement.querySelectorAll('[data-testid="tweetPhoto"] img, [data-testid="tweetMedia"] img, div[data-testid="tweetPhoto"] img');
            
            images.forEach(img => {
                if (!img.classList.contains('smart-preview')) {
                    img.classList.add('smart-preview');
                    
                    // 添加点击展开功能
                    img.addEventListener('click', function(e) {
                        try {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (img.classList.contains('expanded')) {
                                img.classList.remove('expanded');
                                img.style.maxHeight = '120px';
                                debugLog('收起图片');
                            } else {
                                img.classList.add('expanded');
                                img.style.maxHeight = 'none';
                                debugLog('展开图片');
                            }
                        } catch (error) {
                            if (CONFIG.DEBUG) {
                                console.warn('[Twitter Clean View] 图片点击处理出错:', error);
                            }
                        }
                    });
                    
                    debugLog('添加图片智能预览功能');
                }
            });
            
            // 处理视频
            const videos = tweetElement.querySelectorAll('video');
            videos.forEach(video => {
                if (!video.classList.contains('smart-preview')) {
                    video.classList.add('smart-preview');
                    debugLog('添加视频智能预览功能');
                }
            });
        } catch (error) {
            if (CONFIG.DEBUG) {
                console.warn('[Twitter Clean View] 图片优化处理出错:', error);
            }
        }
    }
    
    // 调整页面布局
    function adjustLayout() {
        try {
            // 调整主内容区域，充分利用空间
            const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
            if (primaryColumn) {
                primaryColumn.style.maxWidth = '100%';
                primaryColumn.style.width = '100%';
                primaryColumn.style.marginLeft = '0';
                primaryColumn.style.paddingLeft = '0';
                debugLog('调整主内容区域布局');
            }
            
            // 调整中心内容容器，大幅增加宽度
            const centerContent = document.querySelector('main[role="main"]');
            if (centerContent) {
                centerContent.style.maxWidth = '1200px';
                centerContent.style.margin = '0 auto';
                centerContent.style.padding = '0 20px';
                debugLog('调整中心内容容器');
            }
            
            // 确保页面主体占用全宽
            const body = document.body;
            if (body) {
                body.style.paddingLeft = '0';
            }
        } catch (error) {
            if (CONFIG.DEBUG) {
                console.warn('[Twitter Clean View] 调整布局时出错:', error);
            }
        }
    }
    

    
    // 处理动态加载的内容
    function processNewContent() {
        if (!CONFIG.ENABLED) {
            debugLog('扩展已禁用，跳过处理');
            return;
        }
        
        hideElements();
        optimizeTweets();
        adjustLayout();
        hideRecommendedTab();
        hideDiscoverMore();
    }
    
    // 隐藏「为你推荐」标签页，只保留「关注」
    function hideRecommendedTab() {
        try {
            // 查找标签页容器
            const tablist = document.querySelector('[data-testid="primaryColumn"] div[role="tablist"]');
            if (tablist) {
                const tabs = tablist.querySelectorAll('div[role="tab"]');
                
                // 隐藏第一个标签页（为你推荐）
                if (tabs.length >= 2) {
                    const firstTab = tabs[0];
                    if (firstTab && firstTab.style.display !== 'none') {
                        firstTab.style.display = 'none';
                        debugLog('隐藏「为你推荐」标签页');
                    }
                    
                    // 确保第二个标签页（关注）显示
                    const secondTab = tabs[1];
                    if (secondTab) {
                        secondTab.style.display = 'flex';
                        // 如果没有激活，则激活关注标签页
                        if (!secondTab.getAttribute('aria-selected') || secondTab.getAttribute('aria-selected') === 'false') {
                            secondTab.click();
                            debugLog('自动切换到「关注」标签页');
                        }
                    }
                }
            }
            
            // 额外隐藏可能的推荐相关元素
            const recommendedElements = document.querySelectorAll('[aria-label*="推荐"], [aria-label*="For you"]');
            recommendedElements.forEach(element => {
                if (element.closest('[role="tab"]') && element.style.display !== 'none') {
                    element.style.display = 'none';
                    debugLog('隐藏推荐相关元素');
                }
            });
        } catch (error) {
            if (CONFIG.DEBUG) {
                console.warn('[Twitter Clean View] 处理标签页时出错:', error);
            }
        }
    }
    
    // 隐藏推文详情页的「发现更多」模块
    function hideDiscoverMore() {
        try {
            // 检查是否在推文详情页
            const isDetailPage = window.location.pathname.includes('/status/');
            
            if (isDetailPage) {
                // 查找「发现更多」相关元素
                const discoverSelectors = [
                    '[aria-label*="发现更多"]',
                    '[aria-label*="Discover more"]',
                    'div[data-testid="cellInnerDiv"]:has(span[text*="发现更多"])',
                    'div[data-testid="cellInnerDiv"]:has(span[text*="Discover more"])'
                ];
                
                discoverSelectors.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => {
                            // 检查是否是推文详情页下方的推荐内容
                            const isAfterTweet = element.closest('section[aria-label*="时间线"]') || 
                                                element.previousElementSibling?.querySelector('[data-testid="tweet"]');
                            
                            if (isAfterTweet && element.style.display !== 'none') {
                                element.style.display = 'none';
                                debugLog('隐藏「发现更多」模块');
                            }
                        });
                    } catch (e) {
                        // 忽略选择器错误
                    }
                });
                
                // 隐藏推文下方的相关推文推荐
                const tweetDetails = document.querySelectorAll('[data-testid="tweetDetail"], article[data-testid="tweet"]');
                tweetDetails.forEach(tweetDetail => {
                    let nextElement = tweetDetail.parentElement?.nextElementSibling;
                    while (nextElement) {
                        // 检查是否是推荐内容
                        if (nextElement.querySelector('[data-testid="tweet"]') && 
                            !nextElement.querySelector('[data-testid="tweetDetail"]')) {
                            if (nextElement.style.display !== 'none') {
                                nextElement.style.display = 'none';
                                debugLog('隐藏推文详情页推荐内容');
                            }
                        }
                        nextElement = nextElement.nextElementSibling;
                    }
                });
            }
        } catch (error) {
            if (CONFIG.DEBUG) {
                console.warn('[Twitter Clean View] 处理发现更多模块时出错:', error);
            }
        }
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
        try {
            const debouncedProcess = debounce(processNewContent, CONFIG.OBSERVER_DELAY);
            
            const observer = new MutationObserver((mutations) => {
                try {
                    let hasRelevantChanges = false;
                    
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            // 检查是否有新的推文或相关内容添加
                            for (let node of mutation.addedNodes) {
                                if (node.nodeType === Node.ELEMENT_NODE && node.querySelector) {
                                    try {
                                        if (node.querySelector('[data-testid="tweet"]') ||
                                            node.querySelector('[data-testid="sidebarColumn"]') ||
                                            node.matches('[data-testid="tweet"]') ||
                                            node.matches('[data-testid="sidebarColumn"]')) {
                                            hasRelevantChanges = true;
                                            break;
                                        }
                                    } catch (e) {
                                        // 忽略选择器错误
                                    }
                                }
                            }
                        }
                    });
                    
                    if (hasRelevantChanges) {
                        debugLog('检测到相关DOM变化，重新处理内容');
                        debouncedProcess();
                    }
                } catch (error) {
                    if (CONFIG.DEBUG) {
                        console.warn('[Twitter Clean View] 观察器处理出错:', error);
                    }
                }
            });
            
            // 开始观察
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                debugLog('DOM观察器已启动');
            }
            
            return observer;
        } catch (error) {
            if (CONFIG.DEBUG) {
                console.warn('[Twitter Clean View] 创建观察器失败:', error);
            }
            return null;
        }
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
    

    
    // 启用/禁用扩展功能
    function enableExtension() {
        CONFIG.ENABLED = true;
        
        // 重新应用样式
        addCustomStyles();
        processNewContent();
        
        debugLog('扩展已启用');
    }
    
    function disableExtension() {
        CONFIG.ENABLED = false;
        
        // 移除所有应用的样式修改
        restoreOriginalStyles();
        
        debugLog('扩展已禁用');
    }
    
    // 恢复原始样式
    function restoreOriginalStyles() {
        try {
            // 移除隐藏的元素样式
            CONFIG.HIDE_SELECTORS.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        element.style.display = '';
                        element.style.width = '';
                        element.style.minWidth = '';
                    });
                } catch (error) {
                    // 忽略错误
                }
            });
            
            // 恢复布局样式
            const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
            if (primaryColumn) {
                primaryColumn.style.maxWidth = '';
                primaryColumn.style.width = '';
                primaryColumn.style.marginLeft = '';
                primaryColumn.style.paddingLeft = '';
            }
            
            const centerContent = document.querySelector('main[role="main"]');
            if (centerContent) {
                centerContent.style.maxWidth = '';
                centerContent.style.margin = '';
                centerContent.style.padding = '';
            }
            
            const body = document.body;
            if (body) {
                body.style.paddingLeft = '';
            }
            
            // 恢复标签页显示
            const tablist = document.querySelector('[data-testid="primaryColumn"] div[role="tablist"]');
            if (tablist) {
                const tabs = tablist.querySelectorAll('div[role="tab"]');
                tabs.forEach(tab => {
                    tab.style.display = '';
                });
            }
            
            // 恢复「发现更多」模块
            const discoverElements = document.querySelectorAll('[aria-label*="发现更多"], [aria-label*="Discover more"]');
            discoverElements.forEach(element => {
                element.style.display = '';
            });
            
            // 移除自定义样式表
            const customStyles = document.querySelectorAll('style[data-twitter-clean-view]');
            customStyles.forEach(style => style.remove());
            
            debugLog('已恢复原始样式');
        } catch (error) {
            if (CONFIG.DEBUG) {
                console.warn('[Twitter Clean View] 恢复样式时出错:', error);
            }
        }
    }
    
    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'toggleExtension') {
            if (message.enabled) {
                enableExtension();
            } else {
                disableExtension();
            }
            sendResponse({ success: true });
        }
        return true;
    });
    
    // 从存储中获取设置
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['twitterCleanViewEnabled']);
            const isEnabled = result.twitterCleanViewEnabled !== false; // 默认启用
            
            CONFIG.ENABLED = isEnabled;
            
            debugLog('设置已加载:', { enabled: isEnabled });
        } catch (error) {
            if (CONFIG.DEBUG) {
                console.warn('[Twitter Clean View] 加载设置失败:', error);
            }
            // 使用默认设置
            CONFIG.ENABLED = true;
        }
    }
    
    // 修改addCustomStyles函数，添加标识
    function addCustomStyles() {
        if (!CONFIG.ENABLED) return;
        
        const existingStyle = document.querySelector('style[data-twitter-clean-view]');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.setAttribute('data-twitter-clean-view', 'true');
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
            
            /* 图片智能预览增强样式 */
            .smart-preview {
                position: relative !important;
            }
            
            /* 图片展开状态 */
            .smart-preview.expanded {
                max-height: none !important;
                z-index: 20 !important;
                position: relative !important;
            }
            
            /* 图片预览提示 */
            .smart-preview::after {
                content: "🔍 点击展开" !important;
                position: absolute !important;
                bottom: 4px !important;
                right: 4px !important;
                background: rgba(0, 0, 0, 0.7) !important;
                color: white !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                font-size: 10px !important;
                opacity: 0 !important;
                transition: opacity 0.2s ease !important;
                pointer-events: none !important;
            }
            
            .smart-preview:hover::after {
                opacity: 1 !important;
            }
            
            .smart-preview.expanded::after {
                content: "🔍 点击收起" !important;
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
        debugLog('添加自定义样式');
    }
    
    // 异步初始化
    async function asyncInitialize() {
        await loadSettings();
        
        if (CONFIG.ENABLED) {
            addCustomStyles();
            initialize();
        } else {
            debugLog('扩展已禁用，跳过初始化');
        }
    }
    
    // 启动扩展
    asyncInitialize();
    
    debugLog('Twitter Clean View 扩展已加载');
    
})(); 