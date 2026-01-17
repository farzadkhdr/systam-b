const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// داتای بنەڕەتی
let requests = [];
let advertisements = [];
let houses = [];
let lands = [];

// Setup uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
const adsDir = path.join(uploadsDir, 'ads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(adsDir)) {
    fs.mkdirSync(adsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, adsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('تەنها وێنە پەسەندە!'));
        }
    }
});

// داتای بنەڕەتی
const initialLocations = [
    "شۆرش", "شارێ یۆنانی", "کوێستان(قادسیە)", "سێوەکە", "ئارام گاردن", "کانی", 
    "ئیمپایەر رۆیاڵ ئەپارتمێنت", "خوێندنی باڵا", "قەرەبوی کارێز", "کورانی نوێ", 
    "بەختیاری نوێ", "ئازادی بەحرکە", "برایەتی بەحرکە", "گوڵان ستی", 
    "کۆمەڵگەی ژین (بەحرکە)", "مەلا یاسین", "ڤێلاکانی ئۆکلاند", "ئەربیل گاردن", 
    "ڤانە تاوەرز", "ئۆلیڤ گاردن ستی", "بەحرکەی نوێ", "سەیدان B", "میراج ستی", 
    "خەرابەدراو", "دارەبەن", "فەرمان بەرانی (بەحرکە)", "ڕاستی (بەحرکە)", 
    "دارەتوی نوێ", "بنەسڵاوە", "ئاری", "دیلان", "99 زانکۆ", "زیلان ستی", 
    "94 باداوە", "کارێزان", "ئەدرێس ئەربیل", "بیڤرلی هیڵز", "سەربەستی نوێ (8ی تورەق)", 
    "سەیدان", "جیدە", "قۆپەقران", "ڵایف تاوەرز", "قەرەبووی کەلەکین", 
    "کرێچیانی شاوێس", "قەرەبووی شاوێس", "پیشەسازی باشور", "لالاڤ سەن تاوەرز", 
    "نیو ئیسکان", "نایس ڤیلەج", "کوین تاوەر", "شاری سانا", "چنار (شورتاوە)", 
    "407 عنکاوە", "حاکماوا", "عەنکاوە 128", "سیمی خاتوناوە", "121 گوڵان (گوڵان 1)", 
    "زانایان", "سەروەران", "پێشمەرگە (تاپۆ)", "ئاڵتون ستی", "سێبەردان 2", 
    "هەڤاڵان", "دارەتوو", "ئاڵاسکا تاوەرز", "کەڕک(تاپۆ)", "گەرەسۆری کارت", 
    "گەرەسۆر", "گەرەسۆری تەعجیل", "گوندی ئەمریکی", "هەواری شار", "دوبەی ستی", 
    "تیمار", "ڕووناکی", "موفتی", "ئەندازیاران", "مەنتکاوە", "شادی و بەهاری نوێ", 
    "منارە سیتی 2", "ماردین", "کوردستان", "ئایندە ستی 2", "ئایندە ستی 1", 
    "هەولێر ستی", "فلۆرێنس تاوەر", "سینترۆ تاوەر", "ئۆزال ستی", "هیران ستی", 
    "لانە ستی", "شاری ئەندازیاران", "ژیان ستی", "سەری بڵند", "ڕاستی (عەدالە)", 
    "لەندەن تاوەرز", "زەیتون ستی", "رۆشنبیری 1", "ئاشۆکان", "نەورۆز (حەی عەسکەری)", 
    "14 کونە گورگ", "مارینا 1", "مارینا 2", "مارینا 3", "فیوچەر ستی", 
    "پێشەنگ پلەس تاوەرز", "ماس ستی", "فلۆریا ستی", "شاری هەرشەم 3", "زێڕین ستی", 
    "ئۆلیڤ ستی", "قەرەبووی رەشکین (زەوییەکانی تێرمیناڵ)", "ڤارسان", "قەرەبوی گەنجان", 
    "زین ستی", "ژین", "کوردستان ستی", "نۆبڵ ستی", "فیردەوس ستی", 
    "شاری ژیانی (هاوچەرخ)", "ڤار پارک", "باغمرە شهاب", "دیپلۆماتی سەفیران", 
    "سلاڤا ستی", "پاڤلیۆن", "گەزنەی نوێ", "قەرەبووی گرد جوتیار", "بێریات", 
    "عەزە", "عارەب کەند", "هیوا ستی", "147 عنکاوە", "کانی قرژاڵە", "گرد جوتیار", 
    "هەولێری نوێ", "8 حەسارۆک", "5 حەسارۆک", "فەرمان بەران", "بەختیاری", 
    "وەزیران (پەرلەمان)", "گوندی زانکۆی نوێ", "مامۆستایانی زانکۆ", "شارەوانی"
];

// Load initial data
function loadInitialData() {
    // داواکاریەکان
    requests = [
        {
            id: 'req_1',
            name: 'سەلام عەلی',
            mobile: '07701234567',
            location: 'شۆرش',
            type: 'فرۆشتنی خانوو',
            size: '150',
            price: '50000000',
            saleType: 'تاپۆ',
            status: 'new',
            createdAt: new Date().toISOString()
        },
        {
            id: 'req_2',
            name: 'نەسرین محەممەد',
            mobile: '07702345678',
            location: 'ئارام گاردن',
            type: 'کڕینی خانوو',
            size: '200',
            price: '75000000',
            saleType: 'کارت',
            status: 'processing',
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
    ];

    // رێکلامەکان
    advertisements = [
        {
            id: 'ad_1',
            title: 'خانووی نوێ لە شۆرش',
            description: 'خانووی 3 ژوور لە شۆرش، 150 م²، بە نرخی تایبەت',
            image: '/uploads/ads/house1.jpg',
            link: 'https://example.com/house1',
            views: 150,
            clicks: 25,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'ad_2',
            title: 'فرۆشتنی زەوی لە ئارام گاردن',
            description: 'زەویی 1000 م² لە ناوەندی شاری هەولێر',
            image: '/uploads/ads/land1.jpg',
            link: 'https://example.com/land1',
            views: 89,
            clicks: 12,
            status: 'active',
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updatedAt: new Date(Date.now() - 172800000).toISOString()
        }
    ];

    // خانووەکان
    houses = [
        {
            id: 'house_1',
            owner: 'عەلی کەریم',
            mobile: '07703456789',
            location: 'شۆرش',
            type: 'تاپۆ',
            size: '150 م²',
            price: '50000000 دینار',
            status: 'available',
            createdAt: new Date().toISOString()
        },
        {
            id: 'house_2',
            owner: 'سیروان عەبدوڵا',
            mobile: '07704567890',
            location: 'ئارام گاردن',
            type: 'کارت',
            size: '200 م²',
            price: '75000000 دینار',
            status: 'فرۆشراو',
            createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
        }
    ];

    // زەویەکان
    lands = [
        {
            id: 'land_1',
            owner: 'مەریوان ئەحمەد',
            mobile: '07705678901',
            location: 'گرد جوتیار',
            size: '1000 م²',
            price: '200000000 دینار',
            status: 'available',
            createdAt: new Date().toISOString()
        }
    ];
}

// Load initial data
loadInitialData();

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API چالاکە',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Get locations
app.get('/api/locations', (req, res) => {
    res.json({
        success: true,
        data: initialLocations
    });
});

// === درخواست‌ها (Requests) ===

// Get all requests
app.get('/api/requests', (req, res) => {
    const { status, type, limit } = req.query;
    
    let filteredRequests = [...requests];
    
    if (status) {
        filteredRequests = filteredRequests.filter(req => req.status === status);
    }
    
    if (type) {
        filteredRequests = filteredRequests.filter(req => req.type === type);
    }
    
    // Sort by date (newest first)
    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (limit) {
        filteredRequests = filteredRequests.slice(0, parseInt(limit));
    }
    
    res.json({
        success: true,
        count: filteredRequests.length,
        data: filteredRequests
    });
});

// Create new request
app.post('/api/requests', (req, res) => {
    try {
        const { name, mobile, location, type, size, price, saleType } = req.body;
        
        // Validation
        if (!name || !mobile || !location || !type || !size || !price) {
            return res.status(400).json({
                success: false,
                error: 'تکایە هەموو خانەکان پڕ بکەرەوە'
            });
        }
        
        const newRequest = {
            id: `req_${uuidv4()}`,
            name,
            mobile,
            location,
            type,
            size,
            price,
            saleType: saleType || 'تاپۆ',
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        requests.push(newRequest);
        
        res.status(201).json({
            success: true,
            message: 'داواکاریەکەت بە سەرکەوتویی نێردرا!',
            data: newRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە ناردنی داواکاری'
        });
    }
});

// Update request status
app.put('/api/requests/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const requestIndex = requests.findIndex(req => req.id === id);
        
        if (requestIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'داواکاری نەدۆزرایەوە'
            });
        }
        
        requests[requestIndex].status = status;
        requests[requestIndex].updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'دۆخی داواکاری نوێکرایەوە',
            data: requests[requestIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە نوێکردنەوەی دۆخی داواکاری'
        });
    }
});

// Get single request
app.get('/api/requests/:id', (req, res) => {
    const { id } = req.params;
    
    const request = requests.find(req => req.id === id);
    
    if (!request) {
        return res.status(404).json({
            success: false,
            error: 'داواکاری نەدۆزرایەوە'
        });
    }
    
    res.json({
        success: true,
        data: request
    });
});

// === رێکلامەکان (Advertisements) ===

// Get all advertisements
app.get('/api/advertisements', (req, res) => {
    res.json({
        success: true,
        count: advertisements.length,
        data: advertisements
    });
});

// Create new advertisement
app.post('/api/advertisements', upload.single('image'), (req, res) => {
    try {
        const { title, description, link } = req.body;
        const imageFile = req.file;
        
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'تکایە سەردێری رێکلام بنووسە'
            });
        }
        
        const newAd = {
            id: `ad_${uuidv4()}`,
            title,
            description: description || '',
            image: imageFile ? `/uploads/ads/${imageFile.filename}` : '',
            link: link || '',
            views: 0,
            clicks: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        advertisements.push(newAd);
        
        res.status(201).json({
            success: true,
            message: 'رێکلام بە سەرکەوتویی نێردرا',
            data: newAd
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'هەڵە لە ناردنی رێکلام'
        });
    }
});

// Track ad click
app.post('/api/advertisements/:id/click', (req, res) => {
    try {
        const { id } = req.params;
        
        const adIndex = advertisements.findIndex(ad => ad.id === id);
        
        if (adIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'رێکلام نەدۆزرایەوە'
            });
        }
        
        advertisements[adIndex].clicks = (advertisements[adIndex].clicks || 0) + 1;
        advertisements[adIndex].updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'کلیک تۆمارکرا',
            clicks: advertisements[adIndex].clicks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە تۆمارکردنی کلیک'
        });
    }
});

// Update ad status
app.put('/api/advertisements/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const adIndex = advertisements.findIndex(ad => ad.id === id);
        
        if (adIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'رێکلام نەدۆزرایەوە'
            });
        }
        
        advertisements[adIndex].status = status;
        advertisements[adIndex].updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            message: `رێکلام ${status === 'active' ? 'چالاک' : 'ناچالاک'} کرا`,
            data: advertisements[adIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە گۆڕینی دۆخی رێکلام'
        });
    }
});

// Get single advertisement
app.get('/api/advertisements/:id', (req, res) => {
    const { id } = req.params;
    
    const ad = advertisements.find(ad => ad.id === id);
    
    if (!ad) {
        return res.status(404).json({
            success: false,
            error: 'رێکلام نەدۆزرایەوە'
        });
    }
    
    // Increase views
    ad.views = (ad.views || 0) + 1;
    ad.updatedAt = new Date().toISOString();
    
    res.json({
        success: true,
        data: ad
    });
});

// Delete advertisement
app.delete('/api/advertisements/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const adIndex = advertisements.findIndex(ad => ad.id === id);
        
        if (adIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'رێکلام نەدۆزرایەوە'
            });
        }
        
        // Remove image file if exists
        const ad = advertisements[adIndex];
        if (ad.image && ad.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, ad.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        advertisements.splice(adIndex, 1);
        
        res.json({
            success: true,
            message: 'رێکلام سڕایەوە'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە سڕینەوەی رێکلام'
        });
    }
});

// === خانووەکان (Houses) ===

// Get all houses
app.get('/api/houses', (req, res) => {
    res.json({
        success: true,
        count: houses.length,
        data: houses
    });
});

// Create new house
app.post('/api/houses', (req, res) => {
    try {
        const { owner, mobile, location, type, size, price, status } = req.body;
        
        if (!owner || !mobile || !location || !price) {
            return res.status(400).json({
                success: false,
                error: 'تکایە هەموو خانەکان پڕ بکەرەوە'
            });
        }
        
        const newHouse = {
            id: `house_${uuidv4()}`,
            owner,
            mobile,
            location,
            type: type || 'تاپۆ',
            size: size || '',
            price,
            status: status || 'available',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        houses.push(newHouse);
        
        res.status(201).json({
            success: true,
            message: 'خانوو بە سەرکەوتویی زیادکرا',
            data: newHouse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە زیادکردنی خانوو'
        });
    }
});

// Update house status
app.put('/api/houses/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const houseIndex = houses.findIndex(house => house.id === id);
        
        if (houseIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'خانوو نەدۆزرایەوە'
            });
        }
        
        houses[houseIndex].status = status;
        houses[houseIndex].updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'دۆخی خانوو نوێکرایەوە',
            data: houses[houseIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە نوێکردنەوەی دۆخی خانوو'
        });
    }
});

// Delete house
app.delete('/api/houses/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const houseIndex = houses.findIndex(house => house.id === id);
        
        if (houseIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'خانوو نەدۆزرایەوە'
            });
        }
        
        houses.splice(houseIndex, 1);
        
        res.json({
            success: true,
            message: 'خانوو سڕایەوە'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە سڕینەوەی خانوو'
        });
    }
});

// === زەویەکان (Lands) ===

// Get all lands
app.get('/api/lands', (req, res) => {
    res.json({
        success: true,
        count: lands.length,
        data: lands
    });
});

// Create new land
app.post('/api/lands', (req, res) => {
    try {
        const { owner, mobile, location, size, price, status } = req.body;
        
        if (!owner || !mobile || !location || !price) {
            return res.status(400).json({
                success: false,
                error: 'تکایە هەموو خانەکان پڕ بکەرەوە'
            });
        }
        
        const newLand = {
            id: `land_${uuidv4()}`,
            owner,
            mobile,
            location,
            size: size || '',
            price,
            status: status || 'available',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        lands.push(newLand);
        
        res.status(201).json({
            success: true,
            message: 'زەوی بە سەرکەوتویی زیادکرا',
            data: newLand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە زیادکردنی زەوی'
        });
    }
});

// Update land status
app.put('/api/lands/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const landIndex = lands.findIndex(land => land.id === id);
        
        if (landIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'زەوی نەدۆزرایەوە'
            });
        }
        
        lands[landIndex].status = status;
        lands[landIndex].updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'دۆخی زەوی نوێکرایەوە',
            data: lands[landIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە نوێکردنەوەی دۆخی زەوی'
        });
    }
});

// Delete land
app.delete('/api/lands/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const landIndex = lands.findIndex(land => land.id === id);
        
        if (landIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'زەوی نەدۆزرایەوە'
            });
        }
        
        lands.splice(landIndex, 1);
        
        res.json({
            success: true,
            message: 'زەوی سڕایەوە'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە سڕینەوەی زەوی'
        });
    }
});

// Export data
app.get('/api/export/requests', (req, res) => {
    try {
        const exportData = requests.map(req => ({
            ناو: req.name,
            مۆبایل: req.mobile,
            جۆر: req.type,
            شوێن: req.location,
            قەبارە: req.size,
            نرخ: req.price,
            جۆری_فرۆشتن: req.saleType,
            دۆخ: req.status === 'new' ? 'نوێ' : 
                  req.status === 'processing' ? 'لە کاردایە' : 
                  req.status === 'accepted' ? 'وەرگیراو' : 
                  req.status === 'rejected' ? 'ڕەتکراو' : req.status,
            کات: new Date(req.createdAt).toLocaleString('ku')
        }));
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=داواکاریەکان.csv');
        
        // Convert to CSV
        const csv = convertToCSV(exportData);
        res.send(csv);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'هەڵە لە هەناردەکردنی داتا'
        });
    }
});

// Helper function to convert to CSV
function convertToCSV(arr) {
    if (arr.length === 0) return '';
    
    const keys = Object.keys(arr[0]);
    const header = keys.join(',');
    const rows = arr.map(obj => {
        return keys.map(key => {
            const value = obj[key];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',');
    });
    
    return [header, ...rows].join('\n');
}

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'پەڕە نەدۆزرایەوە'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('هەڵەی API:', err);
    
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            error: 'هەڵە لە بارکردنی فایل: ' + err.message
        });
    }
    
    res.status(500).json({
        success: false,
        error: 'هەڵەی ناوخۆیی سێرڤەر'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`سێرڤەر چالاکە لە پۆرت ${PORT}`);
    console.log(`API لە بەردەستدایە: http://localhost:${PORT}/api`);
    console.log(`پشکنینی تەندروستی: http://localhost:${PORT}/api/health`);
});