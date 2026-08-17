import 'package:geolocator/geolocator.dart';
import 'package:yordamchi_med/core/network/api_client.dart';
import 'package:yordamchi_med/core/utils/distance_calculator.dart';
import 'package:yordamchi_med/features/schools_directory/domain/models/school_model.dart';

class SchoolsRepository {
  final ApiClient apiClient;

  SchoolsRepository({required this.apiClient});

  final List<SchoolModel> _mockSchools = [
    const SchoolModel(
      id: 'sch_12',
      number: 12,
      name: "12-sonli ixtisoslashtirilgan maktab-internat",
      region: "Toshkent shahri",
      district: "Chilonzor tumani",
      address: "Chilonzor 9-mavze, Qatortol ko'chasi 14-uy",
      phone: "+998 71 278 12 34",
      classCount: 14,
      teacherCount: 28,
      studentCount: 160,
      lat: 41.2858,
      lng: 69.2035,
      description:
          "Nutqida og'ir nuqsoni bo'lgan va logopedik yordamga muhtoj bolalar uchun ixtisoslashtirilgan davlat maktab-internati. Zamonaviy sensor integratsiya xonalari va tibbiy reabilitatsiya blokiga ega.",
      workingHours: "08:00 - 18:00 (Yotoqxona 24/7)",
      foundedYear: 1978,
      isVerified: true,
      licenseNumber: "SSV-2023-00912",
      photoUrls: [
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
      ],
      faqItems: [
        FaqItem(
          question: "Qabul qilish uchun qanday hujjatlar kerak?",
          answer:
              "Tibbiy-psixologik-pedagogik komissiya (TPPK) xulosasi, tug'ilganlik haqida guvohnoma nusxasi, 086-forma tibbiy ma'lumotnoma va ota-ona arizasi talab etiladi.",
        ),
        FaqItem(
          question: "Bolalar yotoqxonada qolishi mumkinmi?",
          answer:
              "Ha, uzoq viloyat va tumanlardan kelgan bolalar uchun 24/7 rejimida ishlaydigan barcha qulayliklarga ega yotoqxona va 5 mahal issiq ovqat ta'minlangan.",
        ),
        FaqItem(
          question: "Tibbiy nazorat qanday tashkil etilgan?",
          answer:
              "Maktabda pediatr, nevropatolog, psixiatr va doimiy navbatchi hamshiralar faoliyat olib boradi.",
        ),
      ],
    ),
    const SchoolModel(
      id: 'sch_25',
      number: 25,
      name: "25-sonli ko'zi ojiz bolalar maktab-internati",
      region: "Toshkent shahri",
      district: "Yunusobod tumani",
      address: "Yunusobod 4-mavze, Amir Temur ko'chasi 88-uy",
      phone: "+998 71 224 56 78",
      classCount: 12,
      teacherCount: 24,
      studentCount: 130,
      lat: 41.3645,
      lng: 69.2885,
      description:
          "Ko'rishida nuqsoni bo'lgan bolalar uchun Brayl tizimida ta'lim beruvchi zamonaviy ixtisoslashgan ta'lim muassasasi.",
      workingHours: "08:30 - 17:30",
      foundedYear: 1985,
      isVerified: true,
      licenseNumber: "SSV-2022-04821",
      faqItems: [
        FaqItem(
          question: "Brayl darsliklari bilan ta'minlanganmi?",
          answer: "Barcha o'quvchilar bepul Brayl shriftidagi darsliklar bilan to'liq ta'minlanadi.",
        ),
      ],
    ),
    const SchoolModel(
      id: 'sch_102',
      number: 102,
      name: "102-sonli zaif eshituvchi bolalar maktab-internati",
      region: "Toshkent shahri",
      district: "Shayxontohur tumani",
      address: "Navoiy ko'chasi 32-uy",
      phone: "+998 71 241 89 01",
      classCount: 16,
      teacherCount: 32,
      studentCount: 180,
      lat: 41.3211,
      lng: 69.2415,
      description:
          "Surdopedagogika va imo-ishora tili bo'yicha yuqori malakali mutaxassislar faoliyat olib boruvchi ixtisoslashtirilgan maktab.",
      workingHours: "08:00 - 18:00",
      foundedYear: 1968,
      isVerified: true,
      licenseNumber: "SSV-2021-00102",
      faqItems: [
        FaqItem(
          question: "Eshitish apparatlari moslashtiriladimi?",
          answer: "Ha, maktabda audiologiya xonasi va audiometriya tekshiruvlari mavjud.",
        ),
      ],
    ),
    const SchoolModel(
      id: 'sch_57',
      number: 57,
      name: "57-sonli tayanch-harakat apparati buzilgan bolalar maktabi",
      region: "Toshkent shahri",
      district: "Mirzo Ulug'bek tumani",
      address: "Buyuk Ipak Yo'li ko'chasi 112-uy",
      phone: "+998 71 267 33 44",
      classCount: 10,
      teacherCount: 20,
      studentCount: 110,
      lat: 41.3325,
      lng: 69.3412,
      description:
          "Davolash jismoniy tarbiyasi (DJT), gidroterapiya va massaj xonalari bilan jihozlangan ixtisoslashtirilgan reabilitatsiya maktabi.",
      workingHours: "08:00 - 17:00",
      foundedYear: 1990,
      isVerified: true,
      licenseNumber: "SSV-2023-00057",
    ),
  ];

  Future<List<SchoolModel>> getSchools({Position? userPosition}) async {
    await Future.delayed(const Duration(milliseconds: 250));

    final userLat = userPosition?.latitude ?? 41.2995;
    final userLng = userPosition?.longitude ?? 69.2401;

    final updated = _mockSchools.map((school) {
      final dist = DistanceCalculator.calculateDistanceKm(
        userLat,
        userLng,
        school.lat,
        school.lng,
      );
      return school.copyWith(distanceKm: dist);
    }).toList();

    updated.sort((a, b) => (a.distanceKm ?? 0).compareTo(b.distanceKm ?? 0));
    return updated;
  }
}
