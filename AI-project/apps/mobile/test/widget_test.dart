import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:resq_mobile/main.dart';

void main() {
  testWidgets('counter smoke test placeholder', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: ResQApp()));
  });
}
