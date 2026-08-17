import 'dart:math';
import 'package:yordamchi_med/core/network/api_client.dart';
import 'package:yordamchi_med/core/storage/local_cache_service.dart';
import 'package:yordamchi_med/features/teacher/class_roster/domain/models/student_roster_item.dart';

class TeacherRosterRepository {
  final ApiClient apiClient;
  final LocalCacheService localCache;

  TeacherRosterRepository({
    required this.apiClient,
    required this.localCache,
  });

  final List<StudentRosterItem> _students = [
    const StudentRosterItem(
      id: 'std_101',
      firstName: 'Ali',
      lastName: 'Karimov',
      className: '4-A',
      parentPhone: '+998 90 123 45 67',
      parentLogin: '12_001',
      parentPassword: 'parent123',
      diagnosis: "Nutq buzilishi va diqqat yetishmovchiligi",
      birthDate: '2016-04-12',
      todayMood: '🌟 Xursand',
      todayHealth: 'Sog‘lom',
      hasTodayLog: true,
    ),
    const StudentRosterItem(
      id: 'std_102',
      firstName: 'Zarina',
      lastName: 'Ergasheva',
      className: '4-A',
      parentPhone: '+998 93 345 67 89',
      parentLogin: '12_002',
      parentPassword: 'pass_7849',
      diagnosis: "Eshitishda yengil nuqson",
      birthDate: '2016-07-25',
      todayMood: '🙂 Oddiy',
      todayHealth: 'Sog‘lom',
      hasTodayLog: true,
    ),
    const StudentRosterItem(
      id: 'std_103',
      firstName: 'Bekzod',
      lastName: 'Nazarov',
      className: '4-A',
      parentPhone: '+998 97 789 01 23',
      parentLogin: '12_003',
      parentPassword: 'pass_3910',
      diagnosis: "Sensorika va motorika tuzatish",
      birthDate: '2016-02-18',
      hasTodayLog: false,
    ),
    const StudentRosterItem(
      id: 'std_104',
      firstName: 'Shaxzoda',
      lastName: 'Yusupova',
      className: '4-B',
      parentPhone: '+998 99 890 12 34',
      parentLogin: '12_004',
      parentPassword: 'pass_4812',
      diagnosis: "Umumiy nutq rivojlanishi sekinlashuvi",
      birthDate: '2016-11-05',
      todayMood: '😴 Charchagan',
      todayHealth: 'Yengil bezovta',
      hasTodayLog: true,
    ),
    const StudentRosterItem(
      id: 'std_105',
      firstName: 'Jasur',
      lastName: 'Oripov',
      className: '2-A',
      parentPhone: '+998 94 456 78 90',
      parentLogin: '12_005',
      parentPassword: 'pass_9021',
      diagnosis: "Logopedik korreksiya",
      birthDate: '2018-05-14',
      hasTodayLog: false,
    ),
  ];

  Future<List<StudentRosterItem>> getRoster() async {
    try {
      final res = await apiClient.get('/students');
      if (res is List && res.isNotEmpty) {
        return res.map((e) => StudentRosterItem.fromJson(e)).toList();
      }
    } catch (_) {}

    await Future.delayed(const Duration(milliseconds: 250));
    return List<StudentRosterItem>.from(_students);
  }

  Future<StudentRosterItem> addNewStudent({
    required String firstName,
    required String lastName,
    required String className,
    required String parentPhone,
    String? diagnosis,
    String? birthDate,
    int schoolNumber = 12,
  }) async {
    final seqNum = _students.length + 1;
    final parentLogin = "${schoolNumber}_${seqNum.toString().padLeft(3, '0')}";
    final parentPassword = "pass_${1000 + Random().nextInt(8999)}";

    final newStudent = StudentRosterItem(
      id: 'std_${DateTime.now().millisecondsSinceEpoch}',
      firstName: firstName,
      lastName: lastName,
      className: className,
      parentPhone: parentPhone,
      parentLogin: parentLogin,
      parentPassword: parentPassword,
      diagnosis: diagnosis,
      birthDate: birthDate,
      hasTodayLog: false,
    );

    try {
      await apiClient.post('/students', data: {
        'first_name': firstName,
        'last_name': lastName,
        'class_name': className,
        'phone': parentPhone,
        'diagnosis': diagnosis,
        'dob': birthDate,
      });
    } catch (_) {}

    _students.insert(0, newStudent);
    return newStudent;
  }

  Future<void> updateStudentTodayLog({
    required String studentId,
    required String mood,
    required String health,
    required String teacherNote,
    String? aiAnalysis,
  }) async {
    final idx = _students.indexWhere((s) => s.id == studentId);
    if (idx != -1) {
      _students[idx] = _students[idx].copyWith(
        todayMood: mood,
        todayHealth: health,
        hasTodayLog: true,
      );
    }
  }
}
