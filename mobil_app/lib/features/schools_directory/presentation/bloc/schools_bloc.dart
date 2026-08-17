import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:yordamchi_med/features/schools_directory/data/repositories/schools_repository.dart';
import 'package:yordamchi_med/features/schools_directory/domain/models/school_model.dart';

// Events
abstract class SchoolsEvent extends Equatable {
  const SchoolsEvent();

  @override
  List<Object?> get props => [];
}

class LoadSchoolsEvent extends SchoolsEvent {}

class SelectSchoolEvent extends SchoolsEvent {
  final SchoolModel school;

  const SelectSchoolEvent(this.school);

  @override
  List<Object?> get props => [school];
}

class RequestLocationEvent extends SchoolsEvent {}

// States
abstract class SchoolsState extends Equatable {
  const SchoolsState();

  @override
  List<Object?> get props => [];
}

class SchoolsLoading extends SchoolsState {}

class SchoolsLoaded extends SchoolsState {
  final List<SchoolModel> schools;
  final SchoolModel? selectedSchool;
  final Position? userPosition;

  const SchoolsLoaded({
    required this.schools,
    this.selectedSchool,
    this.userPosition,
  });

  SchoolsLoaded copyWith({
    List<SchoolModel>? schools,
    SchoolModel? selectedSchool,
    Position? userPosition,
  }) {
    return SchoolsLoaded(
      schools: schools ?? this.schools,
      selectedSchool: selectedSchool ?? this.selectedSchool,
      userPosition: userPosition ?? this.userPosition,
    );
  }

  @override
  List<Object?> get props => [schools, selectedSchool, userPosition];
}

class SchoolsError extends SchoolsState {
  final String message;

  const SchoolsError(this.message);

  @override
  List<Object?> get props => [message];
}

// BLoC
class SchoolsBloc extends Bloc<SchoolsEvent, SchoolsState> {
  final SchoolsRepository repository;

  SchoolsBloc({required this.repository}) : super(SchoolsLoading()) {
    on<LoadSchoolsEvent>(_onLoadSchools);
    on<SelectSchoolEvent>(_onSelectSchool);
    on<RequestLocationEvent>(_onRequestLocation);
  }

  Future<void> _onLoadSchools(
    LoadSchoolsEvent event,
    Emitter<SchoolsState> emit,
  ) async {
    emit(SchoolsLoading());
    try {
      Position? position;
      try {
        final permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.always ||
            permission == LocationPermission.whileInUse) {
          position = await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium),
          );
        }
      } catch (_) {}

      final list = await repository.getSchools(userPosition: position);
      emit(SchoolsLoaded(
        schools: list,
        selectedSchool: list.isNotEmpty ? list.first : null,
        userPosition: position,
      ));
    } catch (e) {
      emit(SchoolsError(e.toString()));
    }
  }

  void _onSelectSchool(
    SelectSchoolEvent event,
    Emitter<SchoolsState> emit,
  ) {
    if (state is! SchoolsLoaded) return;
    final curr = state as SchoolsLoaded;
    emit(curr.copyWith(selectedSchool: event.school));
  }

  Future<void> _onRequestLocation(
    RequestLocationEvent event,
    Emitter<SchoolsState> emit,
  ) async {
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse) {
        final position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium),
        );
        final list = await repository.getSchools(userPosition: position);

        if (state is SchoolsLoaded) {
          final curr = state as SchoolsLoaded;
          emit(curr.copyWith(schools: list, userPosition: position));
        } else {
          emit(SchoolsLoaded(
            schools: list,
            selectedSchool: list.isNotEmpty ? list.first : null,
            userPosition: position,
          ));
        }
      }
    } catch (_) {}
  }
}
