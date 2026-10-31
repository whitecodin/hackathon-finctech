import type {Language,NavPath} from '../types.ts';
export const copy: Record<Language,{
home:string;records:string;udhar:string;stock:string;regulars:string;auto:string;payments:string;reconcile:string;forecast:string;mohalla:string;audit:string;data:string;league:string;help:string;more:string;savings:string;loans:string;passport:string;privacy:string;settings:string;signout:string;language:string;day:string;night:string;back:string;shop:string;}> = {
 en:{home:'My Dukaan',records:'Daily Hisaab',udhar:'Udhar',stock:'My Stock',regulars:'Regular Customers',auto:'Auto Hisaab',payments:'Payment Review',reconcile:'Match Payments',forecast:'Sales Forecast',mohalla:'Mohalla Power',audit:'Activity History',data:'My Data & Privacy',league:'Bazaar League',help:'Ask for Help',more:'More',savings:'My Savings',loans:'Loan Guide',passport:'Shop Details',privacy:'Privacy',settings:'Shop Settings',signout:'Sign out',language:'Language',day:'Day',night:'Night',back:'Back to my shop',shop:'Dukaan'},
 hi:{home:'मेरी दुकान',records:'रोज़ का हिसाब',udhar:'उधार',stock:'सामान',regulars:'पक्के ग्राहक',auto:'ऑटो हिसाब',payments:'पेमेंट जाँच',reconcile:'पैसे मिलान',forecast:'सामान का अंदाज़ा',mohalla:'मोहल्ला पावर',audit:'बदलाव का हिसाब',data:'मेरा डेटा',league:'बाज़ार लीग',help:'मदद',more:'और',savings:'बचत',loans:'लोन की जानकारी',passport:'दुकान की जानकारी',privacy:'निजता',settings:'सेटिंग्स',signout:'बाहर जाएँ',language:'भाषा',day:'दिन',night:'रात',back:'मेरी दुकान पर जाएँ',shop:'दुकान'},
 bn:{home:'আমার দোকান',records:'দৈনিক হিসাব',udhar:'বাকি',stock:'স্টক',regulars:'নিয়মিত ক্রেতা',auto:'অটো হিসাব',payments:'পেমেন্ট দেখুন',reconcile:'পেমেন্ট মিলান',forecast:'চাহিদার হিসাব',mohalla:'মহল্লা পাওয়ার',audit:'পরিবর্তনের ইতিহাস',data:'আমার তথ্য',league:'বাজার লিগ',help:'সাহায্য',more:'আরও',savings:'সঞ্চয়',loans:'ঋণের তথ্য',passport:'দোকানের তথ্য',privacy:'গোপনীয়তা',settings:'সেটিংস',signout:'সাইন আউট',language:'ভাষা',day:'দিন',night:'রাত',back:'আমার দোকানে ফিরুন',shop:'দোকান'}
};
export const mainLinks:{id:NavPath;icon:string;key:'home'|'records'|'udhar'|'stock'}[]=[
 {id:'overview',icon:'storefront',key:'home'},
 {id:'daily-hisaab',icon:'receipt_long',key:'records'},
 {id:'udhar',icon:'handshake',key:'udhar'},
 {id:'stock',icon:'inventory_2',key:'stock'}
];
export const extraLinks:{id:NavPath;icon:string;key:'league'|'regulars'|'auto'|'payments'|'reconcile'|'forecast'|'mohalla'|'audit'|'data'|'help'|'savings'|'loans'|'passport'|'privacy'|'settings'}[]=[
 {id:'auto-hisaab',icon:'bolt',key:'auto'},
 {id:'merchant-league',icon:'emoji_events',key:'league'},
 {id:'regulars',icon:'group',key:'regulars'},
 {id:'transaction-safety',icon:'security',key:'payments'},
 {id:'reconciliation',icon:'fact_check',key:'reconcile'},
 {id:'forecast',icon:'show_chart',key:'forecast'},
 {id:'mohalla-power',icon:'groups',key:'mohalla'},
 {id:'audit-history',icon:'history',key:'audit'},
 {id:'data-controls',icon:'shield',key:'data'},
 {id:'ai-financial-coach',icon:'support_agent',key:'help'},
 {id:'business-resilience',icon:'savings',key:'savings'},
 {id:'credit-readiness',icon:'account_balance',key:'loans'},
 {id:'financial-passport',icon:'badge',key:'passport'},
 {id:'settings',icon:'tune',key:'settings'}
];
