// Twitter Clean View - Popup脚本

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const enableToggle = document.getElementById('enableToggle');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const refreshPageBtn = document.getElementById('refreshPage');
    const openSettingsBtn = document.getElementById('openSettings');
    const featuresSection = document.querySelector('.features-section');
    
    // 配置
    const STORAGE_KEY = 'twitterCleanViewEnabled';
    
    // 初始化popup
    async function initializePopup() {
        try {
            // 添加加载状态
            document.body.classList.add('loading');
            
            // 获取当前设置
            const result = await chrome.storage.sync.get([STORAGE_KEY]);
            const isEnabled = result[STORAGE_KEY] !== false; // 默认启用
            
            // 更新UI状态
            updateUI(isEnabled);
            
            // 移除加载状态
            document.body.classList.remove('loading');
        } catch (error) {
            console.error('初始化popup失败:', error);
        }
    }
    
    // 更新UI状态
    function updateUI(isEnabled) {
        enableToggle.checked = isEnabled;
        
        if (isEnabled) {
            statusText.textContent = '扩展已启用';
            statusIndicator.classList.remove('disabled');
            document.body.classList.remove('disabled-state');
        } else {
            statusText.textContent = '扩展已禁用';
            statusIndicator.classList.add('disabled');
            document.body.classList.add('disabled-state');
        }
        
        // 添加淡入动画
        document.querySelector('.popup-container').classList.add('fade-in');
    }
    
    // 保存设置
    async function saveSetting(isEnabled) {
        try {
            await chrome.storage.sync.set({ [STORAGE_KEY]: isEnabled });
            console.log('设置已保存:', isEnabled);
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }
    
    // 通知content script更新状态
    async function notifyContentScript(isEnabled) {
        try {
            // 获取当前活动标签页
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tabs.length > 0) {
                const tab = tabs[0];
                
                // 检查是否是推特页面
                if (tab.url && (tab.url.includes('x.com') || tab.url.includes('twitter.com'))) {
                    // 发送消息给content script
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'toggleExtension',
                        enabled: isEnabled
                    }).catch(() => {
                        // 如果content script未加载，忽略错误
                        console.log('Content script 未响应，可能需要刷新页面');
                    });
                }
            }
        } catch (error) {
            console.error('通知content script失败:', error);
        }
    }
    
    // 开关切换事件
    enableToggle.addEventListener('change', async function() {
        const isEnabled = this.checked;
        
        // 更新UI
        updateUI(isEnabled);
        
        // 保存设置
        await saveSetting(isEnabled);
        
        // 通知content script
        await notifyContentScript(isEnabled);
        
        // 显示反馈
        showFeedback(isEnabled ? '扩展已启用' : '扩展已禁用');
    });
    
    // 刷新页面按钮
    refreshPageBtn.addEventListener('click', async function() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tabs.length > 0) {
                const tab = tabs[0];
                
                // 检查是否是推特页面
                if (tab.url && (tab.url.includes('x.com') || tab.url.includes('twitter.com'))) {
                    chrome.tabs.reload(tab.id);
                    window.close(); // 关闭popup
                } else {
                    showFeedback('请先访问推特页面', 'warning');
                }
            }
        } catch (error) {
            console.error('刷新页面失败:', error);
            showFeedback('刷新失败', 'error');
        }
    });
    
    // 高级设置按钮
    openSettingsBtn.addEventListener('click', function() {
        // 创建设置对话框
        showAdvancedSettings();
    });
    
    // 显示反馈信息
    function showFeedback(message, type = 'success') {
        // 创建反馈元素
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${type}`;
        feedback.textContent = message;
        
        // 样式
        feedback.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        // 3秒后移除
        setTimeout(() => {
            feedback.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }
    
    // 显示高级设置
    function showAdvancedSettings() {
        const settings = [
            '🔧 调试模式：在控制台显示详细日志',
            '📏 自定义宽度：调整推文区域宽度',
            '🎨 主题设置：切换明暗主题',
            '⚡ 性能优化：调整动画和效果',
            '📱 移动适配：优化移动端显示'
        ];
        
        let settingsHTML = `
            <div style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #1da1f2;">
                <h4 style="margin-bottom: 12px; color: #333;">🚧 高级设置 (开发中)</h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
        `;
        
        settings.forEach(setting => {
            settingsHTML += `<li style="padding: 4px 0; color: #666; font-size: 13px;">${setting}</li>`;
        });
        
        settingsHTML += `
                </ul>
                <p style="margin-top: 12px; font-size: 12px; color: #9ca3af;">
                    这些功能将在未来版本中提供
                </p>
            </div>
        `;
        
        // 临时显示在features区域下方
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = settingsHTML;
        tempDiv.style.animation = 'fadeIn 0.3s ease';
        
        featuresSection.appendChild(tempDiv);
        
        // 5秒后移除
        setTimeout(() => {
            tempDiv.style.opacity = '0';
            setTimeout(() => {
                if (tempDiv.parentNode) {
                    tempDiv.parentNode.removeChild(tempDiv);
                }
            }, 300);
        }, 5000);
    }
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // 检查当前页面状态
    async function checkCurrentPage() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tabs.length > 0) {
                const tab = tabs[0];
                const isTwitterPage = tab.url && (tab.url.includes('x.com') || tab.url.includes('twitter.com'));
                
                if (!isTwitterPage) {
                    // 如果不是推特页面，显示提示
                    const warning = document.createElement('div');
                    warning.innerHTML = `
                        <div style="padding: 12px; background: #fef3cd; border: 1px solid #fde047; border-radius: 6px; margin-bottom: 16px;">
                            <p style="font-size: 12px; color: #92400e; margin: 0;">
                                ⚠️ 当前不在推特页面，扩展功能不会生效
                            </p>
                        </div>
                    `;
                    
                    document.querySelector('.main-content').insertBefore(
                        warning.firstElementChild, 
                        document.querySelector('.status-section')
                    );
                }
            }
        } catch (error) {
            console.error('检查页面状态失败:', error);
        }
    }
    
    // 启动初始化
    initializePopup();
    checkCurrentPage();
    
    // 监听存储变化
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes[STORAGE_KEY]) {
            const newValue = changes[STORAGE_KEY].newValue;
            updateUI(newValue !== false);
        }
    });
    
    console.log('Twitter Clean View Popup 已加载');
}); 