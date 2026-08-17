import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yordamchi_med/features/parent/notifications/data/repositories/parent_notifications_repository.dart';
import 'package:yordamchi_med/features/parent/notifications/domain/models/parent_notification_model.dart';

// Events
abstract class ParentNotificationsEvent extends Equatable {
  const ParentNotificationsEvent();

  @override
  List<Object?> get props => [];
}

class LoadNotificationsEvent extends ParentNotificationsEvent {}

class RespondToPickupEvent extends ParentNotificationsEvent {
  final String notificationId;
  final ParentResponseStatus status;

  const RespondToPickupEvent({
    required this.notificationId,
    required this.status,
  });

  @override
  List<Object?> get props => [notificationId, status];
}

// States
abstract class ParentNotificationsState extends Equatable {
  const ParentNotificationsState();

  @override
  List<Object?> get props => [];
}

class ParentNotificationsLoading extends ParentNotificationsState {}

class ParentNotificationsLoaded extends ParentNotificationsState {
  final List<ParentAlert> alerts;
  final String? toastMessage;

  const ParentNotificationsLoaded({
    required this.alerts,
    this.toastMessage,
  });

  @override
  List<Object?> get props => [alerts, toastMessage];
}

class ParentNotificationsBloc
    extends Bloc<ParentNotificationsEvent, ParentNotificationsState> {
  final ParentNotificationsRepository repository;

  ParentNotificationsBloc({required this.repository})
      : super(ParentNotificationsLoading()) {
    on<LoadNotificationsEvent>(_onLoad);
    on<RespondToPickupEvent>(_onRespond);
  }

  Future<void> _onLoad(
    LoadNotificationsEvent event,
    Emitter<ParentNotificationsState> emit,
  ) async {
    emit(ParentNotificationsLoading());
    try {
      final alerts = await repository.getNotifications();
      emit(ParentNotificationsLoaded(alerts: alerts));
    } catch (_) {
      emit(const ParentNotificationsLoaded(alerts: []));
    }
  }

  Future<void> _onRespond(
    RespondToPickupEvent event,
    Emitter<ParentNotificationsState> emit,
  ) async {
    if (state is! ParentNotificationsLoaded) return;
    final curr = state as ParentNotificationsLoaded;

    await repository.respondToPickup(
      notificationId: event.notificationId,
      status: event.status,
    );

    final updated = curr.alerts.map((a) {
      if (a.id == event.notificationId) {
        return a.copyWith(responseStatus: event.status);
      }
      return a;
    }).toList();

    emit(ParentNotificationsLoaded(
      alerts: updated,
      toastMessage: "Javobingiz o'qituvchiga real-vaqtda yetkazildi!",
    ));
  }
}
