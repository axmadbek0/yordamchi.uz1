import 'package:yordamchi_med/core/network/api_client.dart';
import 'package:yordamchi_med/core/storage/local_cache_service.dart';
import 'package:yordamchi_med/features/parent/daily_reports/domain/models/daily_report_models.dart';

class ParentReportsRepository {
  final ApiClient apiClient;
  final LocalCacheService localCache;

  ParentReportsRepository({
    required this.apiClient,
    required this.localCache,
  });

  Future<List<Student>> getChildren() async {
    try {
      final response = await apiClient.get('/students/me/children');
      if (response is List) {
        return response.map((item) => Student.fromJson(item)).toList();
      }
    } catch (_) {}

    return [
      const Student(
        id: 'std_1',
        fullName: 'Ali Karimova',
        className: '4-A sinf',
        schoolNumber: 12,
        diagnosis: "Nutq buzilishi va diqqat yetishmovchiligi",
        birthDate: '2016-04-12',
      ),
      const Student(
        id: 'std_2',
        fullName: 'Madina Karimova',
        className: '2-B sinf',
        schoolNumber: 12,
        diagnosis: "Yengil logopedik tuzatish",
        birthDate: '2018-09-20',
      ),
    ];
  }

  Future<DailyStatusEntry> getTodayReport(String studentId) async {
    try {
      final response = await apiClient.get('/students/$studentId');
      if (response != null && response['logs'] is List && (response['logs'] as List).isNotEmpty) {
        return DailyStatusEntry.fromJson((response['logs'] as List).first);
      }
    } catch (_) {}

    return DailyStatusEntry(
      id: 'log_today_${DateTime.now().day}',
      studentId: studentId,
      date: DateTime.now(),
      health: HealthType.soglom,
      mood: MoodType.xursand,
      teacherNote:
          "Bugun matematika darsida faol qatnashdi. Sensorika mashg'ulotlarida mayda motorika mashqlarini a'lo darajada bajardi. Tushlikni to'liq yedi va tushki uyqudan o'z vaqtida uyg'ondi.",
      aiAnalysis:
          "🌟 AI Pedagogik xulosa: Bolaning ijtimoiy faolligi va diqqatni jamlash ko'rsatkichi o'tgan haftaga nisbatan 24% ga oshgan. Uy sharoitida sensorik o'yinlar (konstruktor, qum terapiyasi) bilan shug'ullanishni davom ettirish tavsiya etiladi.",
      teacherName: "Rustam Ahmedov",
    );
  }

  Future<List<WeeklyMoodPoint>> getWeeklyMoodDynamics(String studentId) async {
    final now = DateTime.now();
    return [
      WeeklyMoodPoint(
        dayName: 'Dush',
        score: 4.0,
        mood: MoodType.oddiy,
        date: now.subtract(const Duration(days: 4)),
      ),
      WeeklyMoodPoint(
        dayName: 'Sesh',
        score: 4.5,
        mood: MoodType.oddiy,
        date: now.subtract(const Duration(days: 3)),
      ),
      WeeklyMoodPoint(
        dayName: 'Chor',
        score: 3.0,
        mood: MoodType.tashvishli,
        date: now.subtract(const Duration(days: 2)),
      ),
      WeeklyMoodPoint(
        dayName: 'Pay',
        score: 5.0,
        mood: MoodType.xursand,
        date: now.subtract(const Duration(days: 1)),
      ),
      WeeklyMoodPoint(
        dayName: 'Juma',
        score: 5.0,
        mood: MoodType.xursand,
        date: now,
      ),
    ];
  }
}
