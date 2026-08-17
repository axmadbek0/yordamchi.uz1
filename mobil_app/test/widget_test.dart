import 'package:flutter_test/flutter_test.dart';
import 'package:yordamchi_med/app.dart';
import 'package:yordamchi_med/core/network/api_client.dart';
import 'package:yordamchi_med/core/storage/local_cache_service.dart';
import 'package:yordamchi_med/core/storage/secure_storage_service.dart';
import 'package:yordamchi_med/core/utils/date_formatter.dart';
import 'package:yordamchi_med/core/utils/distance_calculator.dart';
import 'package:yordamchi_med/features/auth/domain/models/user_model.dart';
import 'package:yordamchi_med/features/parent/daily_reports/domain/models/daily_report_models.dart';
import 'package:yordamchi_med/features/schools_directory/domain/models/school_model.dart';

void main() {
  group('Unit Tests - Domain Models & Utilities', () {
    test('UserModel JSON serialization test', () {
      final user = UserModel(
        id: 'usr_101',
        login: '12_001',
        fullName: 'Aziza Karimova',
        role: UserRole.parent,
        schoolNumber: 12,
        phone: '+998901234567',
      );

      final json = user.toJson();
      expect(json['id'], 'usr_101');
      expect(json['role'], 'parent');

      final deserialized = UserModel.fromJson(json);
      expect(deserialized.id, user.id);
      expect(deserialized.role, UserRole.parent);
      expect(deserialized.schoolNumber, 12);
    });

    test('MoodType and HealthType mappings test', () {
      expect(MoodType.fromString('xursand'), MoodType.xursand);
      expect(MoodType.fromString('tashvishli'), MoodType.tashvishli);
      expect(HealthType.fromString('soglom'), HealthType.soglom);
      expect(HealthType.fromString('betob'), HealthType.betob);
    });

    test('DistanceCalculator test', () {
      // Toshkent markazi -> Chilonzor
      final dist = DistanceCalculator.calculateDistanceKm(
        41.2995,
        69.2401,
        41.2858,
        69.2035,
      );
      expect(dist, greaterThan(0));
      expect(DistanceCalculator.formatDistance(dist), contains('km'));
    });

    test('DateFormatter Uzbek formatting test', () {
      final date = DateTime(2026, 8, 15, 14, 30);
      final formatted = DateFormatter.formatUzbekDate(date);
      expect(formatted, contains('2026'));
      expect(formatted, contains('avgust'));
    });

    test('SchoolModel copyWith test', () {
      const school = SchoolModel(
        id: 'sch_1',
        number: 12,
        name: '12-maktab',
        region: 'Toshkent',
        district: 'Chilonzor',
        address: 'Chilonzor',
        phone: '+998712000000',
        classCount: 10,
        teacherCount: 20,
        studentCount: 150,
        lat: 41.28,
        lng: 69.20,
      );

      final updated = school.copyWith(distanceKm: 3.4);
      expect(updated.distanceKm, 3.4);
      expect(updated.name, '12-maktab');
    });
  });

  group('Widget Tests - Application Bootstrap', () {
    testWidgets('App launches smoke test', (WidgetTester tester) async {
      final secureStorage = SecureStorageService();
      final localCache = LocalCacheService();
      final apiClient = ApiClient(secureStorage: secureStorage);

      await tester.pumpWidget(
        YordamchiMedApp(
          secureStorage: secureStorage,
          localCache: localCache,
          apiClient: apiClient,
        ),
      );

      // App structure renders correctly
      expect(find.byType(YordamchiMedApp), findsOneWidget);

      // Pump single frame
      await tester.pump(const Duration(milliseconds: 200));
    });
  });
}
