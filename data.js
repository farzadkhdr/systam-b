// فەنکشنی API بۆ وەرگرتنی داتا لە سیستەمی A
// لەسەر Vercel Serverless Functions

// ئەمە بۆ هەڵگرتنی داتاکان لە یادگادا (لە ڕاستیدا دەبێت داتابەیس بەکاربهێنیت)
let receivedData = [];

export default async function handler(req, res) {
    // چاوەڕوانی POST لە سیستەمی A و GET لە کلایەنتەکە
    if (req.method === 'POST') {
        // وەرگرتنی داتا لە سیستەمی A
        try {
            const data = req.body;
            
            // چەککردنی کلیلی ئاسایش (ئەگەر بونی هەبێت)
            const authHeader = req.headers['x-system-a-key'];
            const expectedKey = 'system-a-secret-key-12345'; // هەمان کلیلی سیستەمی A
            
            if (authHeader !== expectedKey) {
                console.warn('کلیلی نادروستی ئاسایش لە سیستەمی A');
                // دەتوانیت وەڵامی ڕەتکردنەوە بدەیتەوە یان ڕێگەبدەیت
                // return res.status(401).json({ error: 'کلیلی نادروست' });
            }
            
            // زیادکردنی نیشانەی کاتی وەرگرتن
            data.receivedAt = new Date().toISOString();
            data.receivedBySystemB = true;
            data.id = Date.now(); // نیشانەی تاک
            
            // زیادکردنی داتاکە بۆ لیستەکە
            receivedData.unshift(data);
            
            // سنووردارکردنی لیستەکە بۆ 50 تۆمار (بۆ نەهێشتنەوەی زۆر)
            if (receivedData.length > 50) {
                receivedData = receivedData.slice(0, 50);
            }
            
            console.log('داتای وەرگیراو لە سیستەمی A:', {
                name: data.name,
                email: data.email,
                timestamp: data.receivedAt
            });
            
            // وەڵامی سەرکەوتوو
            return res.status(200).json({
                success: true,
                message: 'زانیاریەکان بە سەرکەوتووی وەرگیران',
                receivedData: data,
                totalReceived: receivedData.length,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('هەڵە لە وەرگرتنی داتا:', error);
            return res.status(500).json({ 
                error: 'هەڵەی ناوەخۆیی سرڤەر لە وەرگرتنی داتا',
                details: error.message 
            });
        }
        
    } else if (req.method === 'GET') {
        // گەڕاندنەوەی داتاکانی وەرگیراو بۆ نمایشکردن لە پەڕەکەدا
        return res.status(200).json({
            success: true,
            message: 'داتاکانی وەرگیراو',
            receivedData: receivedData,
            receivedCount: receivedData.length,
            lastReceived: receivedData.length > 0 ? receivedData[0].receivedAt : null,
            system: 'System B',
            timestamp: new Date().toISOString()
        });
        
    } else {
        // ڕێگەپێنەدراو
        return res.status(405).json({ error: 'تەنها POST یان GET ڕێگادەپێدرێت' });
    }
}