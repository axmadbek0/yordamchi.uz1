import 'package:equatable/equatable.dart';

class FaqItem extends Equatable {
  final String question;
  final String answer;

  const FaqItem({
    required this.question,
    required this.answer,
  });

  @override
  List<Object?> get props => [question, answer];
}

class SchoolModel extends Equatable {
  final String id;
  final int number;
  final String name;
  final String region;
  final String district;
  final String address;
  final String phone;
  final int classCount;
  final int teacherCount;
  final int studentCount;
  final double lat;
  final double lng;
  final String? description;
  final String? workingHours;
  final int? foundedYear;
  final bool isVerified;
  final String? licenseNumber;
  final List<String> photoUrls;
  final List<FaqItem> faqItems;
  final double? distanceKm;

  const SchoolModel({
    required this.id,
    required this.number,
    required this.name,
    required this.region,
    required this.district,
    required this.address,
    required this.phone,
    required this.classCount,
    required this.teacherCount,
    required this.studentCount,
    required this.lat,
    required this.lng,
    this.description,
    this.workingHours = "08:00 - 18:00 (Dushanba - Shanba)",
    this.foundedYear = 1984,
    this.isVerified = true,
    this.licenseNumber = "SSV-2024-98421",
    this.photoUrls = const [],
    this.faqItems = const [],
    this.distanceKm,
  });

  SchoolModel copyWith({
    String? id,
    int? number,
    String? name,
    String? region,
    String? district,
    String? address,
    String? phone,
    int? classCount,
    int? teacherCount,
    int? studentCount,
    double? lat,
    double? lng,
    String? description,
    String? workingHours,
    int? foundedYear,
    bool? isVerified,
    String? licenseNumber,
    List<String>? photoUrls,
    List<FaqItem>? faqItems,
    double? distanceKm,
  }) {
    return SchoolModel(
      id: id ?? this.id,
      number: number ?? this.number,
      name: name ?? this.name,
      region: region ?? this.region,
      district: district ?? this.district,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      classCount: classCount ?? this.classCount,
      teacherCount: teacherCount ?? this.teacherCount,
      studentCount: studentCount ?? this.studentCount,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      description: description ?? this.description,
      workingHours: workingHours ?? this.workingHours,
      foundedYear: foundedYear ?? this.foundedYear,
      isVerified: isVerified ?? this.isVerified,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      photoUrls: photoUrls ?? this.photoUrls,
      faqItems: faqItems ?? this.faqItems,
      distanceKm: distanceKm ?? this.distanceKm,
    );
  }

  @override
  List<Object?> get props => [id, number, name, region, lat, lng, distanceKm];
}
