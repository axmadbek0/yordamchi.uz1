import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/core/widgets/state_views/shimmer_loading_view.dart';
import 'package:yordamchi_med/features/schools_directory/presentation/bloc/schools_bloc.dart';
import 'package:yordamchi_med/features/schools_directory/domain/models/school_model.dart';
import 'package:yordamchi_med/features/schools_directory/presentation/widgets/school_card_carousel_item.dart';
import 'package:yordamchi_med/features/schools_directory/presentation/screens/school_detail_screen.dart';

class SchoolsMapScreen extends StatefulWidget {
  const SchoolsMapScreen({super.key});

  @override
  State<SchoolsMapScreen> createState() => _SchoolsMapScreenState();
}

class _SchoolsMapScreenState extends State<SchoolsMapScreen> {
  final MapController _mapController = MapController();
  final ScrollController _carouselController = ScrollController();

  @override
  void initState() {
    super.initState();
    context.read<SchoolsBloc>().add(LoadSchoolsEvent());
  }

  @override
  void dispose() {
    _carouselController.dispose();
    super.dispose();
  }

  void _centerOnSchool(SchoolModel school) {
    HapticHelper.selectionClick();
    _mapController.move(
      LatLng(school.lat, school.lng),
      14.0,
    );
    context.read<SchoolsBloc>().add(SelectSchoolEvent(school));
  }

  void _openSchoolDetail(SchoolModel school) {
    HapticHelper.lightImpact();
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => SchoolDetailScreen(school: school),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: CustomAppBar(
        title: AppStrings.schoolsMapTitle,
        subtitle: AppStrings.schoolsMapSubtitle,
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location_rounded, color: AppColors.primary),
            onPressed: () {
              HapticHelper.lightImpact();
              context.read<SchoolsBloc>().add(RequestLocationEvent());
            },
          ),
        ],
      ),
      body: BlocBuilder<SchoolsBloc, SchoolsState>(
        builder: (context, state) {
          if (state is SchoolsLoading) {
            return const ShimmerLoadingView(itemCount: 4);
          }

          if (state is SchoolsLoaded) {
            final selected = state.selectedSchool ??
                (state.schools.isNotEmpty ? state.schools.first : null);

            final initialCenter = selected != null
                ? LatLng(selected.lat, selected.lng)
                : const LatLng(41.2995, 69.2401);

            return Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: initialCenter,
                    initialZoom: 12.5,
                    minZoom: 8.0,
                    maxZoom: 18.0,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'uz.yordamchi.med',
                    ),
                    MarkerLayer(
                      markers: state.schools.map((school) {
                        final isSelected = selected != null && selected.id == school.id;
                        return Marker(
                          point: LatLng(school.lat, school.lng),
                          width: isSelected ? 52 : 42,
                          height: isSelected ? 52 : 42,
                          child: GestureDetector(
                            onTap: () => _centerOnSchool(school),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primary
                                    : AppColors.deepDark,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2.5),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withAlpha(80),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  "${school.number}",
                                  style: AppTypography.labelSmall.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                    fontSize: isSelected ? 13 : 11,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
                Positioned(
                  top: 12,
                  left: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.surfaceDark : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(30),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.near_me_rounded,
                            size: 16, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            "Xaritada ${state.schools.length} ta ixtisoslashtirilgan maktab",
                            style: AppTypography.labelSmall.copyWith(
                              color: isDark
                                  ? AppColors.textPrimaryDark
                                  : AppColors.deepDark,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  bottom: 16,
                  left: 0,
                  right: 0,
                  child: SizedBox(
                    height: 140,
                    child: ListView.builder(
                      controller: _carouselController,
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      itemCount: state.schools.length,
                      itemBuilder: (context, index) {
                        final school = state.schools[index];
                        final isSelected = selected != null && selected.id == school.id;
                        return SchoolCardCarouselItem(
                          school: school,
                          isSelected: isSelected,
                          onTap: () => _centerOnSchool(school),
                          onDetailTap: () => _openSchoolDetail(school),
                        );
                      },
                    ),
                  ),
                ),
              ],
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}
