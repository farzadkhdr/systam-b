// فایلی JavaScript بۆ سیستەمی B

document.addEventListener('DOMContentLoaded', function() {
    const dataList = document.getElementById('dataList');
    const totalReceived = document.getElementById('totalReceived');
    const lastReceived = document.getElementById('lastReceived');
    const systemStatus = document.getElementById('systemStatus');
    const refreshBtn = document.getElementById('refreshBtn');
    const apiUrlElement = document.getElementById('apiUrl');
    const systemAUrlElement = document.getElementById('systemAUrl');
    
    // نمایشکردنی ئەدرێسی API لەسەر پەڕەکە
    const currentUrl = window.location.origin;
    apiUrlElement.textContent = `${currentUrl}/api/receive-data`;
    
    // ئەدرێسی سیستەمی A (دەتوانی بگۆڕی)
    // لەم نموونەدا، سیستەمی A لەسەر هەمان دۆمەینە بەڵام دەتوانی بگۆڕی
    // بۆ نمونە: https://system-a.vercel.app
    const systemAUrl = currentUrl.replace('systam-b', 'system-a') || 'سیستەمی A';
    systemAUrlElement.textContent = systemAUrl;
    
    // بارکردنی زانیاریەکان لە سەرەتاوە
    loadReceivedData();
    
    // کلیکردن لە دوگمەی نوێکردنەوە
    refreshBtn.addEventListener('click', loadReceivedData);
    
    // بارکردنی زانیاریە وەرگێڕدراوەکان
    async function loadReceivedData() {
        try {
            setSystemStatus('بارکردن...', 'loading');
            
            const response = await fetch('/api/receive-data');
            
            if (!response.ok) {
                throw new Error(`وەڵامی HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // نوێکردنەوەی ئامارەکان
                totalReceived.textContent = data.receivedCount || 0;
                lastReceived.textContent = data.lastReceived ? formatTime(data.lastReceived) : '-';
                
                // نمایشکردنی زانیاریەکان
                displayData(data.receivedData || []);
                
                // نوێکردنەوەی بارودۆخی سیستەم
                setSystemStatus('چالاکە', 'active');
            } else {
                throw new Error(data.error || 'کێشەیەک لە وەڵامەکەدا هەیە');
            }
            
        } catch (error) {
            console.error('هەڵە لە بارکردنی داتاکان:', error);
            setSystemStatus('کێشەی پەیوەندی', 'error');
            
            dataList.innerHTML = `
                <div class="no-data" style="color: #f44336;">
                    هەڵە لە بارکردنی زانیاریەکان: ${error.message}<br>
                    تکایە دووبارە هەوڵ بدەوە
                </div>
            `;
        }
    }
    
    // نمایشکردنی زانیاریەکان لە پەڕەکەدا
    function displayData(dataArray) {
        if (!dataArray || dataArray.length === 0) {
            dataList.innerHTML = `
                <div class="no-data">هیچ زانیاریەک وەرنەگیراوە تا ئێستا...</div>
            `;
            return;
        }
        
        // ڕیزکردنی بەپێی کات (نوێترین لەسەرەوە)
        const sortedData = [...dataArray].sort((a, b) => {
            const timeA = a.receivedAt || a.sentAt || a.timestamp;
            const timeB = b.receivedAt || b.sentAt || b.timestamp;
            return new Date(timeB) - new Date(timeA);
        });
        
        let html = '';
        
        sortedData.forEach(item => {
            const displayTime = item.receivedAt || item.sentAt || item.timestamp;
            const email = item.email || 'بێ ئیمەیڵ';
            const message = item.message || 'بێ پەیام';
            const name = item.name || 'بێ ناو';
            
            html += `
                <div class="data-item">
                    <div class="data-header">
                        <div class="data-name">${name}</div>
                        <div class="data-time">${formatTime(displayTime)}</div>
                    </div>
                    <div class="data-email">${email}</div>
                    <div class="data-message">${message}</div>
                </div>
            `;
        });
        
        dataList.innerHTML = html;
    }
    
    // فۆرماتکردنی کات
    function formatTime(isoString) {
        if (!isoString) return 'بێ کات';
        
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) {
            return 'ئێستا';
        } else if (diffMins < 60) {
            return `پێش ${diffMins} خولەک`;
        } else if (diffHours < 24) {
            return `پێش ${diffHours} کاتژمێر`;
        } else if (diffDays < 7) {
            return `پێش ${diffDays} ڕۆژ`;
        } else {
            return date.toLocaleDateString('ku', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    
    // دانانی بارودۆخی سیستەم
    function setSystemStatus(text, type) {
        systemStatus.textContent = text;
        systemStatus.className = 'system-status';
        
        if (type === 'active') {
            systemStatus.classList.add('status-active');
        } else if (type === 'loading') {
            systemStatus.classList.add('status-loading');
        } else if (type === 'error') {
            systemStatus.classList.add('status-error');
        }
    }
    
    // نوێکردنەوەی ئۆتۆماتیکی هەر 30 چرکە جارێک
    setInterval(loadReceivedData, 30000);
});