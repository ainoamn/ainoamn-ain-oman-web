# 📚 توثيق APIs - Ain Oman

## 🔐 Authentication

جميع الـ APIs تستخدم localStorage للمصادقة:
```javascript
const authData = localStorage.getItem('ain_auth');
const user = JSON.parse(authData);
```

---

## 📊 Properties API

### GET `/api/properties`
**الوصف:** جلب جميع العقارات

**Response:**
```json
{
  "properties": [
    {
      "id": "prop_123",
      "titleAr": "فيلا فاخرة",
      "priceOMR": 150000,
      "status": "active",
      "beds": 4,
      "baths": 3,
      "area": 300
    }
  ]
}
```

### POST `/api/properties`
**الوصف:** إضافة عقار جديد

**Request Body:**
```json
{
  "titleAr": "فيلا فاخرة",
  "titleEn": "Luxury Villa",
  "type": "villa",
  "priceOMR": 150000,
  "province": "muscat",
  "city": "مسقط",
  "beds": 4,
  "baths": 3,
  "area": 300
}
```

---

## ⭐ Reviews API

### GET `/api/reviews?propertyId=prop_123`
**الوصف:** جلب تقييمات عقار معين

**Query Parameters:**
- `propertyId` - معرّف العقار
- `userId` - معرّف المستخدم (اختياري)
- `status` - حالة التقييم (pending/approved/rejected)

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_123",
      "propertyId": "prop_123",
      "userId": "user_456",
      "userName": "أحمد محمد",
      "rating": 5,
      "comment": "عقار ممتاز!",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "stats": {
    "total": 10,
    "averageRating": 4.5,
    "ratings": {
      "5": 6,
      "4": 2,
      "3": 1,
      "2": 1,
      "1": 0
    }
  }
}
```

### POST `/api/reviews`
**الوصف:** إضافة تقييم جديد

**Request Body:**
```json
{
  "propertyId": "prop_123",
  "userId": "user_456",
  "userName": "أحمد محمد",
  "rating": 5,
  "comment": "عقار ممتاز!",
  "aspects": {
    "cleanliness": 5,
    "location": 5,
    "value": 4,
    "communication": 5
  }
}
```

---

## 🔔 Notifications API

### GET `/api/notifications`
**الوصف:** جلب جميع الإشعارات

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "title": "عقار جديد",
      "message": "تم إضافة عقار جديد",
      "type": "info",
      "read": false,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### POST `/api/notifications`
**Request Body:**
```json
{
  "title": "عقار جديد",
  "message": "تم إضافة عقار جديد",
  "type": "info"
}
```

### PATCH `/api/notifications/[id]`
**الوصف:** تحديث إشعار (مثل تعليمه كمقروء)

**Request Body:**
```json
{
  "read": true
}
```

### POST `/api/notifications/mark-all-read`
**الوصف:** تعليم جميع الإشعارات كمقروءة

---

## ✅ Tasks API

### GET `/api/tasks`
**الوصف:** جلب جميع المهام

**Response:**
```json
{
  "tasks": [
    {
      "id": "task_123",
      "title": "مراجعة العقار",
      "description": "مراجعة تفاصيل العقار الجديد",
      "status": "pending",
      "priority": "high",
      "dueDate": "2025-01-20",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### POST `/api/tasks`
**Request Body:**
```json
{
  "title": "مراجعة العقار",
  "description": "مراجعة تفاصيل العقار الجديد",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-01-20"
}
```

### PATCH `/api/tasks/[id]`
**Request Body:**
```json
{
  "status": "completed"
}
```

---

## 📈 Stats API

### GET `/api/stats/profile`
**الوصف:** إحصائيات البروفايل

**Response:**
```json
{
  "properties": {
    "total": 10,
    "active": 7,
    "rented": 2,
    "draft": 1
  },
  "bookings": {
    "total": 5,
    "pending": 1,
    "confirmed": 3,
    "completed": 1
  },
  "notifications": {
    "total": 20,
    "unread": 5
  },
  "tasks": {
    "total": 8,
    "pending": 3,
    "in_progress": 2,
    "completed": 3
  },
  "revenue": {
    "total": 50000,
    "thisMonth": 5000,
    "growth": 15.5
  },
  "chartData": {
    "performance": [...],
    "revenue": [...]
  }
}
```

---

## 🤖 AI Insights API

### GET `/api/insights/ai`
**الوصف:** توصيات ذكية بالذكاء الاصطناعي

**Response:**
```json
{
  "insights": [
    {
      "id": "1",
      "type": "success",
      "icon": "🎯",
      "title": "أداء ممتاز",
      "description": "معدل نجاح الحجوزات 95%",
      "action": "استمر!",
      "category": "performance"
    }
  ]
}
```

---

## 🔑 Roles API

### GET `/api/roles/load`
**الوصف:** تحميل الأدوار والصلاحيات

**Response:**
```json
{
  "roles": [
    {
      "id": "property_owner",
      "nameAr": "مالك عقار",
      "permissions": ["view_properties", "add_property", ...]
    }
  ]
}
```

### POST `/api/roles/save`
**Request Body:**
```json
{
  "roles": [...]
}
```

---

## 📝 ملاحظات مهمة:

1. **جميع الـ APIs تستخدم JSON**
2. **التواريخ بصيغة ISO 8601**
3. **جميع الملفات محفوظة في `.data/`**
4. **لا يوجد قاعدة بيانات - فقط JSON files**
5. **Real-time sync عبر BroadcastChannel**

---

## 🔒 Security Notes:

- ⚠️ النظام الحالي للتطوير فقط
- 🔐 في Production استخدم JWT
- 🛡️ أضف rate limiting
- ✅ Validate جميع الـ inputs
- 🔒 استخدم HTTPS

---

## 🚀 Performance Tips:

- استخدم `useSWR` أو `React Query` للـ caching
- أضف pagination للقوائم الطويلة
- استخدم lazy loading
- Optimize images
- Enable compression

