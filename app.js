// فایلی JavaScript بۆ سیستەمی B

document.addEventListener('DOMContentLoaded', function() {
    const dataList = document.getElementById('dataList');
    const totalReceived = document.getElementById('totalReceived');
    const lastReceived = document.getElementById('lastReceived');
    const systemStatus = document.getElementById('systemStatus');
    const refreshBtn = document.getElementById('refreshBtn');
    const apiUrlElement = document.getElementById('apiUrl');
    
    // نمایشکردنی ئەدرێسی API لەسەر پەڕەکە
    const currentUrl = window.location.origin;
    apiUrlElement.textContent = `${currentUrl}/api/receive-data`;
    
    // بارکردنی زانیاریەکان لە سەرەتاوە
    loadReceivedData();
    
    // کلیکردن لە دوگمەی نوێکردنەوە
    refreshBtn.addEventListener('click', loadReceivedData);
    
    // بارکردنی زانیاریە وەرگێڕدراوەکان
    async function loadReceivedData() {
        try {
            systemStatus.textContent = 'بارکردن...';
            systemStatus.style.color = '#ff9800';
            
            const response = await fetch('/api/receive-data');
            
            if (!response.ok) {
                throw new Error(`وەڵامی HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            // نوێکردنەوەی ئامارەکان
            totalReceived.textContent = data.receivedCount || 0;
            lastReceived.textContent = data.lastReceived ? formatTime(data.lastReceived) : '-';
            
            // نمایشکردنی زانیاریەکان
            displayData(data.receivedData || []);
            
            // نوێکردنەوەی بارودۆخی سیستەم
            systemStatus.textContent = 'چالاکە';
            systemStatus.style.color = '#4caf50';
            
        } catch (error) {
            console.error('هەڵە لە بارکردنی داتاکان:', error);
            systemStatus.textContent = 'کێشەی پەیوەندی';
            systemStatus.style.color = '#f44336';
            
            dataList.innerHTML = `
                <div class="no-data" style="color: #f44336;">
                    هەڵە لە بارکردنی زانیاریەکان: ${error.message}
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
        const sortedData = [...dataArray].sort((a, b) => 
            new Date(b.timestamp || b.sentAt) - new Date(a.timestamp || a.sentAt)
        );
        
        let html = '';
        
        sortedData.forEach(item => {
            html += `
                <div class="data-item">
                    <div class="data-header">
                        <div class="data-name">${item.name || 'بێ ناو'}</div>
                        <div class="data-time">${formatTime(item.timestamp || item.sentAt)}</div>
                    </div>
                    <div class="data-email">${item.email || 'بێ ئیمەیڵ'}</div>
                    <div class="data-message">${item.message || 'بێ پەیام'}</div>
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
});