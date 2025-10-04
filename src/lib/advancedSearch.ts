// src/lib/advancedSearch.ts - نظام البحث والفلترة المتقدم
import { UserRole } from './userRoles';

export type SearchOperator = 'AND' | 'OR' | 'NOT';
export type FilterType = 
  | 'text'           // نص
  | 'number'         // رقم
  | 'range'          // نطاق
  | 'date'           // تاريخ
  | 'boolean'        // منطقي
  | 'select'         // اختيار
  | 'multiselect'    // اختيار متعدد
  | 'location'       // موقع
  | 'price'          // سعر
  | 'area'           // مساحة
  | 'amenities';     // مرافق

export type SortOption = 
  | 'relevance'      // الأهمية
  | 'price_asc'      // السعر تصاعدي
  | 'price_desc'     // السعر تنازلي
  | 'date_asc'       // التاريخ تصاعدي
  | 'date_desc'      // التاريخ تنازلي
  | 'area_asc'       // المساحة تصاعدي
  | 'area_desc'      // المساحة تنازلي
  | 'rating_desc'    // التقييم تنازلي
  | 'popularity';    // الشعبية

export interface SearchFilter {
  id: string;
  field: string;
  type: FilterType;
  label: string;
  operator: SearchOperator;
  value: any;
  options?: any[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
  required?: boolean;
  visible?: boolean;
  dependsOn?: string[];
}

export interface SearchQuery {
  text: string;
  filters: SearchFilter[];
  sort: SortOption;
  page: number;
  limit: number;
  userRole: UserRole;
  location?: {
    lat: number;
    lng: number;
    radius: number; // km
  };
  advanced?: {
    fuzzySearch: boolean;
    autoComplete: boolean;
    suggestions: boolean;
    aiRecommendations: boolean;
  };
}

export interface SearchResult<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: SearchFacet[];
  suggestions: string[];
  recommendations: string[];
  query: SearchQuery;
  executionTime: number;
  metadata: {
    cached: boolean;
    aiEnhanced: boolean;
    personalized: boolean;
  };
}

export interface SearchFacet {
  field: string;
  label: string;
  values: {
    value: any;
    label: string;
    count: number;
    selected: boolean;
  }[];
}

export interface SearchSuggestion {
  text: string;
  type: 'property' | 'location' | 'amenity' | 'price' | 'area';
  confidence: number;
  metadata?: any;
}

// فلاتر البحث المتقدمة
export const ADVANCED_SEARCH_FILTERS: SearchFilter[] = [
  // فلاتر الموقع
  {
    id: 'location',
    field: 'location',
    type: 'location',
    label: 'الموقع',
    operator: 'AND',
    value: null,
    placeholder: 'ابحث عن موقع...',
    description: 'اختر الموقع المطلوب'
  },
  {
    id: 'radius',
    field: 'radius',
    type: 'range',
    label: 'نطاق البحث (كم)',
    operator: 'AND',
    value: 10,
    min: 1,
    max: 100,
    step: 1,
    description: 'نطاق البحث من الموقع المحدد'
  },

  // فلاتر السعر
  {
    id: 'price_min',
    field: 'price',
    type: 'range',
    label: 'السعر من',
    operator: 'AND',
    value: null,
    min: 0,
    max: 1000000,
    step: 1000,
    placeholder: 'الحد الأدنى للسعر'
  },
  {
    id: 'price_max',
    field: 'price',
    type: 'range',
    label: 'السعر إلى',
    operator: 'AND',
    value: null,
    min: 0,
    max: 1000000,
    step: 1000,
    placeholder: 'الحد الأقصى للسعر'
  },

  // فلاتر المساحة
  {
    id: 'area_min',
    field: 'area',
    type: 'range',
    label: 'المساحة من (م²)',
    operator: 'AND',
    value: null,
    min: 0,
    max: 10000,
    step: 10,
    placeholder: 'الحد الأدنى للمساحة'
  },
  {
    id: 'area_max',
    field: 'area',
    type: 'range',
    label: 'المساحة إلى (م²)',
    operator: 'AND',
    value: null,
    min: 0,
    max: 10000,
    step: 10,
    placeholder: 'الحد الأقصى للمساحة'
  },

  // فلاتر نوع العقار
  {
    id: 'property_type',
    field: 'propertyType',
    type: 'multiselect',
    label: 'نوع العقار',
    operator: 'OR',
    value: [],
    options: [
      { value: 'apartment', label: 'شقة' },
      { value: 'villa', label: 'فيلا' },
      { value: 'house', label: 'بيت' },
      { value: 'land', label: 'أرض' },
      { value: 'office', label: 'مكتب' },
      { value: 'shop', label: 'محل' },
      { value: 'warehouse', label: 'مستودع' }
    ],
    description: 'اختر نوع العقار المطلوب'
  },

  // فلاتر الحالة
  {
    id: 'status',
    field: 'status',
    type: 'multiselect',
    label: 'حالة العقار',
    operator: 'OR',
    value: [],
    options: [
      { value: 'available', label: 'متاح' },
      { value: 'rented', label: 'مؤجر' },
      { value: 'sold', label: 'مباع' },
      { value: 'reserved', label: 'محجوز' }
    ]
  },

  // فلاتر المرافق
  {
    id: 'amenities',
    field: 'amenities',
    type: 'amenities',
    label: 'المرافق',
    operator: 'AND',
    value: [],
    options: [
      { value: 'pool', label: 'مسبح' },
      { value: 'garden', label: 'حديقة' },
      { value: 'garage', label: 'جراج' },
      { value: 'security', label: 'أمن' },
      { value: 'elevator', label: 'مصعد' },
      { value: 'balcony', label: 'شرفة' },
      { value: 'parking', label: 'موقف سيارات' },
      { value: 'gym', label: 'صالة رياضية' },
      { value: 'playground', label: 'ملعب أطفال' },
      { value: 'mosque', label: 'مسجد' },
      { value: 'school', label: 'مدرسة' },
      { value: 'hospital', label: 'مستشفى' },
      { value: 'mall', label: 'مول' },
      { value: 'beach', label: 'شاطئ' }
    ],
    description: 'اختر المرافق المطلوبة'
  },

  // فلاتر التاريخ
  {
    id: 'created_after',
    field: 'createdAt',
    type: 'date',
    label: 'تاريخ الإضافة من',
    operator: 'AND',
    value: null,
    description: 'العقارات المضافة بعد هذا التاريخ'
  },
  {
    id: 'created_before',
    field: 'createdAt',
    type: 'date',
    label: 'تاريخ الإضافة إلى',
    operator: 'AND',
    value: null,
    description: 'العقارات المضافة قبل هذا التاريخ'
  },

  // فلاتر إضافية
  {
    id: 'bedrooms',
    field: 'bedrooms',
    type: 'range',
    label: 'عدد الغرف',
    operator: 'AND',
    value: null,
    min: 0,
    max: 10,
    step: 1,
    description: 'عدد غرف النوم'
  },
  {
    id: 'bathrooms',
    field: 'bathrooms',
    type: 'range',
    label: 'عدد الحمامات',
    operator: 'AND',
    value: null,
    min: 0,
    max: 10,
    step: 1,
    description: 'عدد الحمامات'
  },
  {
    id: 'furnished',
    field: 'furnished',
    type: 'select',
    label: 'مفروش',
    operator: 'AND',
    value: null,
    options: [
      { value: 'yes', label: 'مفروش' },
      { value: 'no', label: 'غير مفروش' },
      { value: 'partial', label: 'مفروش جزئياً' }
    ]
  },
  {
    id: 'pet_friendly',
    field: 'petFriendly',
    type: 'boolean',
    label: 'مسموح بالحيوانات الأليفة',
    operator: 'AND',
    value: null
  },
  {
    id: 'smoking_allowed',
    field: 'smokingAllowed',
    type: 'boolean',
    label: 'مسموح بالتدخين',
    operator: 'AND',
    value: null
  }
];

// خيارات الترتيب
export const SORT_OPTIONS: { value: SortOption; label: string; description: string }[] = [
  { value: 'relevance', label: 'الأهمية', description: 'النتائج الأكثر صلة بالبحث' },
  { value: 'price_asc', label: 'السعر (من الأقل للأعلى)', description: 'ترتيب حسب السعر تصاعدياً' },
  { value: 'price_desc', label: 'السعر (من الأعلى للأقل)', description: 'ترتيب حسب السعر تنازلياً' },
  { value: 'date_desc', label: 'الأحدث', description: 'العقارات المضافة مؤخراً' },
  { value: 'date_asc', label: 'الأقدم', description: 'العقارات المضافة قديماً' },
  { value: 'area_desc', label: 'المساحة (من الأكبر للأصغر)', description: 'ترتيب حسب المساحة تنازلياً' },
  { value: 'area_asc', label: 'المساحة (من الأصغر للأكبر)', description: 'ترتيب حسب المساحة تصاعدياً' },
  { value: 'rating_desc', label: 'الأعلى تقييماً', description: 'العقارات الأعلى تقييماً' },
  { value: 'popularity', label: 'الأكثر شعبية', description: 'العقارات الأكثر مشاهدة' }
];

// محرك البحث المتقدم
export class AdvancedSearchEngine {
  private cache: Map<string, SearchResult> = new Map();
  private suggestions: SearchSuggestion[] = [];

  // البحث المتقدم
  async search<T = any>(query: SearchQuery): Promise<SearchResult<T>> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(query);
    
    // التحقق من التخزين المؤقت
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return {
        ...cached,
        metadata: { ...cached.metadata, cached: true }
      } as SearchResult<T>;
    }

    // تنفيذ البحث
    const result = await this.executeSearch<T>(query);
    const executionTime = Date.now() - startTime;

    const searchResult: SearchResult<T> = {
      ...result,
      query,
      executionTime,
      metadata: {
        cached: false,
        aiEnhanced: query.advanced?.aiRecommendations || false,
        personalized: this.isPersonalized(query)
      }
    };

    // حفظ في التخزين المؤقت
    this.cache.set(cacheKey, searchResult);

    return searchResult;
  }

  // البحث السريع
  async quickSearch<T = any>(text: string, userRole: UserRole): Promise<SearchResult<T>> {
    const query: SearchQuery = {
      text,
      filters: [],
      sort: 'relevance',
      page: 1,
      limit: 10,
      userRole,
      advanced: {
        fuzzySearch: true,
        autoComplete: true,
        suggestions: true,
        aiRecommendations: false
      }
    };

    return this.search<T>(query);
  }

  // البحث بالموقع
  async searchByLocation<T = any>(
    location: { lat: number; lng: number; radius: number },
    userRole: UserRole
  ): Promise<SearchResult<T>> {
    const query: SearchQuery = {
      text: '',
      filters: [
        {
          id: 'location',
          field: 'location',
          type: 'location',
          label: 'الموقع',
          operator: 'AND',
          value: location
        }
      ],
      sort: 'relevance',
      page: 1,
      limit: 20,
      userRole,
      location
    };

    return this.search<T>(query);
  }

  // البحث الذكي
  async smartSearch<T = any>(
    text: string,
    userRole: UserRole,
    userPreferences?: any
  ): Promise<SearchResult<T>> {
    const query: SearchQuery = {
      text,
      filters: this.generateSmartFilters(text, userRole, userPreferences),
      sort: 'relevance',
      page: 1,
      limit: 20,
      userRole,
      advanced: {
        fuzzySearch: true,
        autoComplete: true,
        suggestions: true,
        aiRecommendations: true
      }
    };

    return this.search<T>(query);
  }

  // الحصول على الاقتراحات
  async getSuggestions(text: string, userRole: UserRole): Promise<SearchSuggestion[]> {
    if (text.length < 2) return [];

    // محاكاة الاقتراحات
    const suggestions: SearchSuggestion[] = [
      {
        text: `${text} في مسقط`,
        type: 'location',
        confidence: 0.9,
        metadata: { location: 'مسقط' }
      },
      {
        text: `${text} شقة`,
        type: 'property',
        confidence: 0.8,
        metadata: { type: 'apartment' }
      },
      {
        text: `${text} فيلا`,
        type: 'property',
        confidence: 0.7,
        metadata: { type: 'villa' }
      }
    ];

    return suggestions.filter(s => s.text.includes(text));
  }

  // الحصول على الفلاتر المتاحة
  getAvailableFilters(userRole: UserRole): SearchFilter[] {
    return ADVANCED_SEARCH_FILTERS.filter(filter => {
      // إخفاء فلاتر معينة بناء على الدور
      if (userRole === 'guest' && ['price_min', 'price_max'].includes(filter.id)) {
        return false;
      }
      return true;
    });
  }

  // الحصول على خيارات الترتيب
  getSortOptions(): { value: SortOption; label: string; description: string }[] {
    return SORT_OPTIONS;
  }

  // تطبيق الفلاتر
  applyFilters<T = any>(items: T[], filters: SearchFilter[]): T[] {
    return items.filter(item => {
      return filters.every(filter => {
        if (!filter.value && filter.value !== 0) return true;

        const itemValue = this.getNestedValue(item, filter.field);
        
        switch (filter.type) {
          case 'text':
            return this.textFilter(itemValue, filter.value, filter.operator);
          case 'number':
          case 'range':
            return this.numberFilter(itemValue, filter.value, filter.operator);
          case 'date':
            return this.dateFilter(itemValue, filter.value, filter.operator);
          case 'boolean':
            return this.booleanFilter(itemValue, filter.value, filter.operator);
          case 'select':
            return this.selectFilter(itemValue, filter.value, filter.operator);
          case 'multiselect':
            return this.multiselectFilter(itemValue, filter.value, filter.operator);
          case 'location':
            return this.locationFilter(itemValue, filter.value, filter.operator);
          case 'amenities':
            return this.amenitiesFilter(itemValue, filter.value, filter.operator);
          default:
            return true;
        }
      });
    });
  }

  // ترتيب النتائج
  sortResults<T = any>(items: T[], sortOption: SortOption): T[] {
    return [...items].sort((a, b) => {
      switch (sortOption) {
        case 'price_asc':
          return this.getNestedValue(a, 'price') - this.getNestedValue(b, 'price');
        case 'price_desc':
          return this.getNestedValue(b, 'price') - this.getNestedValue(a, 'price');
        case 'date_asc':
          return new Date(this.getNestedValue(a, 'createdAt')).getTime() - 
                 new Date(this.getNestedValue(b, 'createdAt')).getTime();
        case 'date_desc':
          return new Date(this.getNestedValue(b, 'createdAt')).getTime() - 
                 new Date(this.getNestedValue(a, 'createdAt')).getTime();
        case 'area_asc':
          return this.getNestedValue(a, 'area') - this.getNestedValue(b, 'area');
        case 'area_desc':
          return this.getNestedValue(b, 'area') - this.getNestedValue(a, 'area');
        case 'rating_desc':
          return this.getNestedValue(b, 'rating') - this.getNestedValue(a, 'rating');
        case 'popularity':
          return this.getNestedValue(b, 'views') - this.getNestedValue(a, 'views');
        default:
          return 0; // relevance - يتم ترتيبها حسب النتيجة
      }
    });
  }

  // الدوال المساعدة
  private async executeSearch<T = any>(query: SearchQuery): Promise<Omit<SearchResult<T>, 'query' | 'executionTime' | 'metadata'>> {
    // محاكاة البحث
    const mockItems: T[] = this.generateMockResults(query.limit);
    const filteredItems = this.applyFilters(mockItems, query.filters);
    const sortedItems = this.sortResults(filteredItems, query.sort);
    
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedItems = sortedItems.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total: filteredItems.length,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(filteredItems.length / query.limit),
      facets: this.generateFacets(filteredItems, query.filters),
      suggestions: await this.getSuggestions(query.text, query.userRole),
      recommendations: this.generateRecommendations(query)
    };
  }

  private generateCacheKey(query: SearchQuery): string {
    return JSON.stringify({
      text: query.text,
      filters: query.filters.map(f => ({ id: f.id, value: f.value })),
      sort: query.sort,
      page: query.page,
      limit: query.limit,
      userRole: query.userRole
    });
  }

  private generateSmartFilters(text: string, userRole: UserRole, userPreferences?: any): SearchFilter[] {
    const filters: SearchFilter[] = [];

    // تحليل النص لاستخراج الفلاتر
    if (text.includes('شقة')) {
      filters.push({
        id: 'property_type',
        field: 'propertyType',
        type: 'multiselect',
        label: 'نوع العقار',
        operator: 'OR',
        value: ['apartment']
      });
    }

    if (text.includes('فيلا')) {
      filters.push({
        id: 'property_type',
        field: 'propertyType',
        type: 'multiselect',
        label: 'نوع العقار',
        operator: 'OR',
        value: ['villa']
      });
    }

    return filters;
  }

  private isPersonalized(query: SearchQuery): boolean {
    return query.advanced?.aiRecommendations || false;
  }

  private generateMockResults<T = any>(limit: number): T[] {
    const results: T[] = [];
    for (let i = 0; i < limit; i++) {
      results.push({
        id: `prop_${i}`,
        title: `عقار ${i + 1}`,
        price: Math.random() * 100000 + 50000,
        area: Math.random() * 500 + 100,
        location: 'مسقط',
        propertyType: ['apartment', 'villa', 'house'][Math.floor(Math.random() * 3)],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        rating: Math.random() * 5,
        views: Math.floor(Math.random() * 1000)
      } as T);
    }
    return results;
  }

  private generateFacets(items: any[], filters: SearchFilter[]): SearchFacet[] {
    const facets: SearchFacet[] = [];

    // إنشاء facets للخصائص المختلفة
    const propertyTypes = this.groupBy(items, 'propertyType');
    facets.push({
      field: 'propertyType',
      label: 'نوع العقار',
      values: Object.entries(propertyTypes).map(([value, items]) => ({
        value,
        label: this.getPropertyTypeLabel(value),
        count: items.length,
        selected: filters.some(f => f.field === 'propertyType' && f.value?.includes(value))
      }))
    });

    return facets;
  }

  private generateRecommendations(query: SearchQuery): string[] {
    return [
      'جرب البحث بموقع مختلف',
      'اضبط نطاق السعر',
      'أضف مرافق إضافية',
      'غير نوع العقار'
    ];
  }

  private groupBy(items: any[], field: string): { [key: string]: any[] } {
    return items.reduce((groups, item) => {
      const value = this.getNestedValue(item, field);
      if (!groups[value]) groups[value] = [];
      groups[value].push(item);
      return groups;
    }, {});
  }

  private getPropertyTypeLabel(value: string): string {
    const labels: { [key: string]: string } = {
      apartment: 'شقة',
      villa: 'فيلا',
      house: 'بيت',
      land: 'أرض',
      office: 'مكتب'
    };
    return labels[value] || value;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // دوال الفلترة
  private textFilter(itemValue: any, filterValue: any, operator: SearchOperator): boolean {
    if (!itemValue || !filterValue) return true;
    const item = String(itemValue).toLowerCase();
    const filter = String(filterValue).toLowerCase();
    
    switch (operator) {
      case 'AND':
        return item.includes(filter);
      case 'OR':
        return item.includes(filter);
      case 'NOT':
        return !item.includes(filter);
      default:
        return true;
    }
  }

  private numberFilter(itemValue: any, filterValue: any, operator: SearchOperator): boolean {
    if (itemValue === null || itemValue === undefined || filterValue === null || filterValue === undefined) return true;
    const item = Number(itemValue);
    const filter = Number(filterValue);
    
    switch (operator) {
      case 'AND':
        return item >= filter;
      case 'OR':
        return item <= filter;
      case 'NOT':
        return item !== filter;
      default:
        return true;
    }
  }

  private dateFilter(itemValue: any, filterValue: any, operator: SearchOperator): boolean {
    if (!itemValue || !filterValue) return true;
    const item = new Date(itemValue);
    const filter = new Date(filterValue);
    
    switch (operator) {
      case 'AND':
        return item >= filter;
      case 'OR':
        return item <= filter;
      case 'NOT':
        return item.getTime() !== filter.getTime();
      default:
        return true;
    }
  }

  private booleanFilter(itemValue: any, filterValue: any, operator: SearchOperator): boolean {
    if (itemValue === null || itemValue === undefined || filterValue === null || filterValue === undefined) return true;
    
    switch (operator) {
      case 'AND':
        return Boolean(itemValue) === Boolean(filterValue);
      case 'OR':
        return Boolean(itemValue) || Boolean(filterValue);
      case 'NOT':
        return Boolean(itemValue) !== Boolean(filterValue);
      default:
        return true;
    }
  }

  private selectFilter(itemValue: any, filterValue: any, operator: SearchOperator): boolean {
    if (!itemValue || !filterValue) return true;
    
    switch (operator) {
      case 'AND':
        return itemValue === filterValue;
      case 'OR':
        return itemValue === filterValue;
      case 'NOT':
        return itemValue !== filterValue;
      default:
        return true;
    }
  }

  private multiselectFilter(itemValue: any, filterValue: any, operator: SearchOperator): boolean {
    if (!itemValue || !filterValue || !Array.isArray(filterValue)) return true;
    
    const itemArray = Array.isArray(itemValue) ? itemValue : [itemValue];
    
    switch (operator) {
      case 'AND':
        return filterValue.every(val => itemArray.includes(val));
      case 'OR':
        return filterValue.some(val => itemArray.includes(val));
      case 'NOT':
        return !filterValue.some(val => itemArray.includes(val));
      default:
        return true;
    }
  }

  private locationFilter(itemValue: any, filterValue: any, operator: SearchOperator): boolean {
    // تنفيذ فلترة الموقع بناء على المسافة
    return true; // مبسط
  }

  private amenitiesFilter(itemValue: any, filterValue: any, operator: SearchOperator): boolean {
    return this.multiselectFilter(itemValue, filterValue, operator);
  }
}

// إنشاء مثيل واحد من محرك البحث
export const searchEngine = new AdvancedSearchEngine();



