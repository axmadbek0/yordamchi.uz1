import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yordamchi_med/features/parent/daily_reports/data/repositories/parent_reports_repository.dart';
import 'package:yordamchi_med/features/parent/daily_reports/domain/models/daily_report_models.dart';

abstract class ParentReportsEvent extends Equatable {
  const ParentReportsEvent();

  @override
  List<Object?> get props => [];
}

class LoadParentReports extends ParentReportsEvent {}

class SelectChildEvent extends ParentReportsEvent {
  final Student selectedChild;

  const SelectChildEvent(this.selectedChild);

  @override
  List<Object?> get props => [selectedChild];
}

class RefreshTodayReport extends ParentReportsEvent {}

abstract class ParentReportsState extends Equatable {
  const ParentReportsState();

  @override
  List<Object?> get props => [];
}

class ParentReportsLoading extends ParentReportsState {}

class ParentReportsLoaded extends ParentReportsState {
  final List<Student> children;
  final Student selectedChild;
  final DailyStatusEntry todayReport;
  final List<WeeklyMoodPoint> weeklyDynamics;
  final bool isOffline;

  const ParentReportsLoaded({
    required this.children,
    required this.selectedChild,
    required this.todayReport,
    required this.weeklyDynamics,
    this.isOffline = false,
  });

  ParentReportsLoaded copyWith({
    List<Student>? children,
    Student? selectedChild,
    DailyStatusEntry? todayReport,
    List<WeeklyMoodPoint>? weeklyDynamics,
    bool? isOffline,
  }) {
    return ParentReportsLoaded(
      children: children ?? this.children,
      selectedChild: selectedChild ?? this.selectedChild,
      todayReport: todayReport ?? this.todayReport,
      weeklyDynamics: weeklyDynamics ?? this.weeklyDynamics,
      isOffline: isOffline ?? this.isOffline,
    );
  }

  @override
  List<Object?> get props => [children, selectedChild, todayReport, weeklyDynamics, isOffline];
}

class ParentReportsError extends ParentReportsState {
  final String message;

  const ParentReportsError(this.message);

  @override
  List<Object?> get props => [message];
}

class ParentReportsBloc extends Bloc<ParentReportsEvent, ParentReportsState> {
  final ParentReportsRepository repository;

  ParentReportsBloc({required this.repository}) : super(ParentReportsLoading()) {
    on<LoadParentReports>(_onLoadParentReports);
    on<SelectChildEvent>(_onSelectChild);
    on<RefreshTodayReport>(_onRefresh);
  }

  Future<void> _onLoadParentReports(
    LoadParentReports event,
    Emitter<ParentReportsState> emit,
  ) async {
    emit(ParentReportsLoading());
    try {
      final children = await repository.getChildren();
      if (children.isEmpty) {
        emit(const ParentReportsError("Hech qanday farzand biriktirilmagan"));
        return;
      }

      final selected = children.first;
      final report = await repository.getTodayReport(selected.id);
      final dynamics = await repository.getWeeklyMoodDynamics(selected.id);

      emit(ParentReportsLoaded(
        children: children,
        selectedChild: selected,
        todayReport: report,
        weeklyDynamics: dynamics,
      ));
    } catch (e) {
      emit(ParentReportsError(e.toString()));
    }
  }

  Future<void> _onSelectChild(
    SelectChildEvent event,
    Emitter<ParentReportsState> emit,
  ) async {
    if (state is ParentReportsLoaded) {
      final curr = state as ParentReportsLoaded;
      emit(ParentReportsLoading());
      try {
        final report = await repository.getTodayReport(event.selectedChild.id);
        final dynamics = await repository.getWeeklyMoodDynamics(event.selectedChild.id);

        emit(curr.copyWith(
          selectedChild: event.selectedChild,
          todayReport: report,
          weeklyDynamics: dynamics,
        ));
      } catch (e) {
        emit(ParentReportsError(e.toString()));
      }
    }
  }

  Future<void> _onRefresh(
    RefreshTodayReport event,
    Emitter<ParentReportsState> emit,
  ) async {
    if (state is ParentReportsLoaded) {
      final curr = state as ParentReportsLoaded;
      try {
        final report = await repository.getTodayReport(curr.selectedChild.id);
        final dynamics = await repository.getWeeklyMoodDynamics(curr.selectedChild.id);
        emit(curr.copyWith(
          todayReport: report,
          weeklyDynamics: dynamics,
        ));
      } catch (_) {}
    }
  }
}
