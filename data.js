// فەنکشنی API بۆ وەرگرتنی داتا لە سیستەمی A
// لەسەر Vercel Serverless Functions

let receivedData = [];

export default async function handler(req, res) {
    // زیادکردنی CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-System-A-Key'
    );
    
    // چارەسەری CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        try {
            const data = req.body;
            
            console.log('وەرگرتنی POST لە:', req.headers.origin);
            console.log('داتا:', { name: data.name, email: data.email });
            
            // چەککردنی داتا
            if (!data.name || !data.email || !data.message) {
                return res.status(400).json({ 
                    success: false,
                    error: 'ناو، ئیمەیڵ و پەیام پێویستە' 
                });
            }
            
            // زیادکردنی نیشانەی کاتی وەرگرتن
            data.receivedAt = new Date().toISOString();
            data.receivedBySystemB = true;
            data.id = Date.now();
            
            // زیادکردنی داتاکە بۆ لیستەکە
            receivedData.unshift(data);
            
            // سنووردارکردنی لیستەکە بۆ 50 تۆمار
            if (receivedData.length > 50) {
                receivedData = receivedData.slice(0, 50);
            }
            
            console.log('داتای وەرگیراو لە سیستەمی A:', data.name);
            
            // وەڵامی سەرکەوتوو
            return res.status(200).json({
                success: true,
                message: 'زانیاریەکان بە سەرکەوتووی وەرگیران',
                receivedData: data,
                totalReceived: receivedData.length,
                timestamp: new Date().toISOString(),
                note: 'لە سیستەمی Bەوە وەرگیرا'
            });
            
        } catch (error) {
            console.error('هەڵە لە وەرگرتنی داتا:', error);
            return res.status(500).json({ 
                success: false,
                error: 'هەڵەی ناوەخۆیی سرڤەر',
                details: error.message 
            });
        }
        
    } else if (req.method === 'GET') {
        // گەڕاندنەوەی داتاکانی وەرگیراو
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
        return res.status(405).json({ 
            success: false,
            error: 'تەنها POST یان GET ڕێگادەپێدرێت' 
        });
    }
}