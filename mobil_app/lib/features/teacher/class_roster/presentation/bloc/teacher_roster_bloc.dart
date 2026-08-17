import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yordamchi_med/features/teacher/class_roster/data/repositories/teacher_roster_repository.dart';
import 'package:yordamchi_med/features/teacher/class_roster/domain/models/student_roster_item.dart';

// Events
abstract class TeacherRosterEvent extends Equatable {
  const TeacherRosterEvent();

  @override
  List<Object?> get props => [];
}

class LoadRosterEvent extends TeacherRosterEvent {}

class FilterClassEvent extends TeacherRosterEvent {
  final String className;

  const FilterClassEvent(this.className);

  @override
  List<Object?> get props => [className];
}

class SearchStudentEvent extends TeacherRosterEvent {
  final String query;

  const SearchStudentEvent(this.query);

  @override
  List<Object?> get props => [query];
}

class AddStudentEvent extends TeacherRosterEvent {
  final String firstName;
  final String lastName;
  final String className;
  final String parentPhone;
  final String? diagnosis;
  final String? birthDate;

  const AddStudentEvent({
    required this.firstName,
    required this.lastName,
    required this.className,
    required this.parentPhone,
    this.diagnosis,
    this.birthDate,
  });

  @override
  List<Object?> get props => [firstName, lastName, className, parentPhone];
}

// States
abstract class TeacherRosterState extends Equatable {
  const TeacherRosterState();

  @override
  List<Object?> get props => [];
}

class TeacherRosterLoading extends TeacherRosterState {}

class TeacherRosterLoaded extends TeacherRosterState {
  final List<StudentRosterItem> allStudents;
  final List<StudentRosterItem> filteredStudents;
  final String selectedClass;
  final String searchQuery;
  final StudentRosterItem? newlyAddedStudent;

  const TeacherRosterLoaded({
    required this.allStudents,
    required this.filteredStudents,
    this.selectedClass = 'Barchasi',
    this.searchQuery = '',
    this.newlyAddedStudent,
  });

  TeacherRosterLoaded copyWith({
    List<StudentRosterItem>? allStudents,
    List<StudentRosterItem>? filteredStudents,
    String? selectedClass,
    String? searchQuery,
    StudentRosterItem? newlyAddedStudent,
  }) {
    return TeacherRosterLoaded(
      allStudents: allStudents ?? this.allStudents,
      filteredStudents: filteredStudents ?? this.filteredStudents,
      selectedClass: selectedClass ?? this.selectedClass,
      searchQuery: searchQuery ?? this.searchQuery,
      newlyAddedStudent: newlyAddedStudent,
    );
  }

  @override
  List<Object?> get props => [
        allStudents,
        filteredStudents,
        selectedClass,
        searchQuery,
        newlyAddedStudent,
      ];
}

class TeacherRosterError extends TeacherRosterState {
  final String message;

  const TeacherRosterError(this.message);

  @override
  List<Object?> get props => [message];
}

// BLoC
class TeacherRosterBloc extends Bloc<TeacherRosterEvent, TeacherRosterState> {
  final TeacherRosterRepository repository;

  TeacherRosterBloc({required this.repository}) : super(TeacherRosterLoading()) {
    on<LoadRosterEvent>(_onLoad);
    on<FilterClassEvent>(_onFilterClass);
    on<SearchStudentEvent>(_onSearch);
    on<AddStudentEvent>(_onAddStudent);
  }

  Future<void> _onLoad(
    LoadRosterEvent event,
    Emitter<TeacherRosterState> emit,
  ) async {
    emit(TeacherRosterLoading());
    try {
      final students = await repository.getRoster();
      emit(TeacherRosterLoaded(
        allStudents: students,
        filteredStudents: students,
        selectedClass: 'Barchasi',
      ));
    } catch (e) {
      emit(TeacherRosterError(e.toString()));
    }
  }

  void _onFilterClass(
    FilterClassEvent event,
    Emitter<TeacherRosterState> emit,
  ) {
    if (state is! TeacherRosterLoaded) return;
    final curr = state as TeacherRosterLoaded;

    final filtered = _applyFilter(curr.allStudents, event.className, curr.searchQuery);
    emit(curr.copyWith(
      selectedClass: event.className,
      filteredStudents: filtered,
    ));
  }

  void _onSearch(
    SearchStudentEvent event,
    Emitter<TeacherRosterState> emit,
  ) {
    if (state is! TeacherRosterLoaded) return;
    final curr = state as TeacherRosterLoaded;

    final filtered = _applyFilter(curr.allStudents, curr.selectedClass, event.query);
    emit(curr.copyWith(
      searchQuery: event.query,
      filteredStudents: filtered,
    ));
  }

  Future<void> _onAddStudent(
    AddStudentEvent event,
    Emitter<TeacherRosterState> emit,
  ) async {
    if (state is! TeacherRosterLoaded) return;
    final curr = state as TeacherRosterLoaded;

    try {
      final newStudent = await repository.addNewStudent(
        firstName: event.firstName,
        lastName: event.lastName,
        className: event.className,
        parentPhone: event.parentPhone,
        diagnosis: event.diagnosis,
        birthDate: event.birthDate,
      );

      final updatedAll = [newStudent, ...curr.allStudents];
      final filtered = _applyFilter(updatedAll, curr.selectedClass, curr.searchQuery);

      emit(curr.copyWith(
        allStudents: updatedAll,
        filteredStudents: filtered,
        newlyAddedStudent: newStudent,
      ));
    } catch (e) {
      emit(TeacherRosterError(e.toString()));
    }
  }

  List<StudentRosterItem> _applyFilter(
    List<StudentRosterItem> students,
    String className,
    String query,
  ) {
    return students.where((s) {
      final matchesClass = className == 'Barchasi' || s.className == className;
      final matchesQuery = query.isEmpty ||
          s.fullName.toLowerCase().contains(query.toLowerCase()) ||
          s.parentLogin.toLowerCase().contains(query.toLowerCase());
      return matchesClass && matchesQuery;
    }).toList();
  }
}
