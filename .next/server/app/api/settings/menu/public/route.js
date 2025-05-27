/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/settings/menu/public/route";
exports.ids = ["app/api/settings/menu/public/route"];
exports.modules = {

/***/ "(rsc)/./app/api/settings/menu/public/route.ts":
/*!***********************************************!*\
  !*** ./app/api/settings/menu/public/route.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n// Get public menu settings (available to all authenticated users)\nasync function GET() {\n    try {\n        // Get menu settings\n        const menuSettings = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.globalMenuSetting.findMany({\n            orderBy: {\n                position: 'asc'\n            }\n        });\n        // If no settings exist, return defaults\n        if (menuSettings.length === 0) {\n            const defaultMenuItems = [\n                {\n                    id: 'dashboard',\n                    label: 'Dashboard',\n                    path: '/dashboard',\n                    icon: 'Home',\n                    enabled: true,\n                    position: 0\n                },\n                {\n                    id: 'timeline',\n                    label: 'Timeline',\n                    path: '/dashboard/timeline',\n                    icon: 'MessageSquare',\n                    enabled: true,\n                    position: 1\n                },\n                {\n                    id: 'mail',\n                    label: 'Mail',\n                    path: '/dashboard/mail',\n                    icon: 'Mail',\n                    enabled: true,\n                    position: 2\n                },\n                {\n                    id: 'agenda',\n                    label: 'Agenda',\n                    path: '/dashboard/agenda',\n                    icon: 'Calendar',\n                    enabled: true,\n                    position: 3\n                },\n                {\n                    id: 'banking',\n                    label: 'Banking',\n                    path: '/dashboard/banking',\n                    icon: 'DollarSign',\n                    enabled: true,\n                    position: 4\n                },\n                {\n                    id: 'social',\n                    label: 'Social',\n                    path: '/dashboard/social',\n                    icon: 'Users',\n                    enabled: true,\n                    position: 5\n                },\n                {\n                    id: 'weather',\n                    label: 'Weather',\n                    path: '/dashboard/weather',\n                    icon: 'Cloud',\n                    enabled: true,\n                    position: 6\n                },\n                {\n                    id: 'settings',\n                    label: 'Instellingen',\n                    path: '/dashboard/settings',\n                    icon: 'Settings',\n                    enabled: true,\n                    position: 7\n                }\n            ];\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                menuItems: defaultMenuItems\n            });\n        }\n        // Transform to match expected format\n        const menuItems = menuSettings.map((item)=>({\n                id: item.menuItem,\n                label: item.label,\n                path: item.path,\n                icon: item.icon || 'Home',\n                enabled: item.enabled,\n                position: item.position\n            }));\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            menuItems\n        });\n    } catch (error) {\n        console.error('Error fetching public menu settings:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Failed to fetch menu settings'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3NldHRpbmdzL21lbnUvcHVibGljL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUEwQztBQUNMO0FBRXJDLGtFQUFrRTtBQUMzRCxlQUFlRTtJQUNwQixJQUFJO1FBQ0Ysb0JBQW9CO1FBQ3BCLE1BQU1DLGVBQWUsTUFBTUYsK0NBQU1BLENBQUNHLGlCQUFpQixDQUFDQyxRQUFRLENBQUM7WUFDM0RDLFNBQVM7Z0JBQUVDLFVBQVU7WUFBTTtRQUM3QjtRQUVBLHdDQUF3QztRQUN4QyxJQUFJSixhQUFhSyxNQUFNLEtBQUssR0FBRztZQUM3QixNQUFNQyxtQkFBbUI7Z0JBQ3ZCO29CQUFFQyxJQUFJO29CQUFhQyxPQUFPO29CQUFhQyxNQUFNO29CQUFjQyxNQUFNO29CQUFRQyxTQUFTO29CQUFNUCxVQUFVO2dCQUFFO2dCQUNwRztvQkFBRUcsSUFBSTtvQkFBWUMsT0FBTztvQkFBWUMsTUFBTTtvQkFBdUJDLE1BQU07b0JBQWlCQyxTQUFTO29CQUFNUCxVQUFVO2dCQUFFO2dCQUNwSDtvQkFBRUcsSUFBSTtvQkFBUUMsT0FBTztvQkFBUUMsTUFBTTtvQkFBbUJDLE1BQU07b0JBQVFDLFNBQVM7b0JBQU1QLFVBQVU7Z0JBQUU7Z0JBQy9GO29CQUFFRyxJQUFJO29CQUFVQyxPQUFPO29CQUFVQyxNQUFNO29CQUFxQkMsTUFBTTtvQkFBWUMsU0FBUztvQkFBTVAsVUFBVTtnQkFBRTtnQkFDekc7b0JBQUVHLElBQUk7b0JBQVdDLE9BQU87b0JBQVdDLE1BQU07b0JBQXNCQyxNQUFNO29CQUFjQyxTQUFTO29CQUFNUCxVQUFVO2dCQUFFO2dCQUM5RztvQkFBRUcsSUFBSTtvQkFBVUMsT0FBTztvQkFBVUMsTUFBTTtvQkFBcUJDLE1BQU07b0JBQVNDLFNBQVM7b0JBQU1QLFVBQVU7Z0JBQUU7Z0JBQ3RHO29CQUFFRyxJQUFJO29CQUFXQyxPQUFPO29CQUFXQyxNQUFNO29CQUFzQkMsTUFBTTtvQkFBU0MsU0FBUztvQkFBTVAsVUFBVTtnQkFBRTtnQkFDekc7b0JBQUVHLElBQUk7b0JBQVlDLE9BQU87b0JBQWdCQyxNQUFNO29CQUF1QkMsTUFBTTtvQkFBWUMsU0FBUztvQkFBTVAsVUFBVTtnQkFBRTthQUNwSDtZQUVELE9BQU9QLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7Z0JBQUVDLFdBQVdQO1lBQWlCO1FBQ3pEO1FBRUEscUNBQXFDO1FBQ3JDLE1BQU1PLFlBQVliLGFBQWFjLEdBQUcsQ0FBQ0MsQ0FBQUEsT0FBUztnQkFDMUNSLElBQUlRLEtBQUtDLFFBQVE7Z0JBQ2pCUixPQUFPTyxLQUFLUCxLQUFLO2dCQUNqQkMsTUFBTU0sS0FBS04sSUFBSTtnQkFDZkMsTUFBTUssS0FBS0wsSUFBSSxJQUFJO2dCQUNuQkMsU0FBU0ksS0FBS0osT0FBTztnQkFDckJQLFVBQVVXLEtBQUtYLFFBQVE7WUFDekI7UUFFQSxPQUFPUCxxREFBWUEsQ0FBQ2UsSUFBSSxDQUFDO1lBQUVDO1FBQVU7SUFDdkMsRUFBRSxPQUFPSSxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyx3Q0FBd0NBO1FBQ3RELE9BQU9wQixxREFBWUEsQ0FBQ2UsSUFBSSxDQUN0QjtZQUFFSyxPQUFPO1FBQWdDLEdBQ3pDO1lBQUVFLFFBQVE7UUFBSTtJQUVsQjtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMveXVzdGludHJvb3N0L0RvY3VtZW50cy9zaXRlcy95dXN0Ym9hcmQvYXBwL2FwaS9zZXR0aW5ncy9tZW51L3B1YmxpYy9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0AvbGliL3ByaXNtYSdcblxuLy8gR2V0IHB1YmxpYyBtZW51IHNldHRpbmdzIChhdmFpbGFibGUgdG8gYWxsIGF1dGhlbnRpY2F0ZWQgdXNlcnMpXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICB0cnkge1xuICAgIC8vIEdldCBtZW51IHNldHRpbmdzXG4gICAgY29uc3QgbWVudVNldHRpbmdzID0gYXdhaXQgcHJpc21hLmdsb2JhbE1lbnVTZXR0aW5nLmZpbmRNYW55KHtcbiAgICAgIG9yZGVyQnk6IHsgcG9zaXRpb246ICdhc2MnIH1cbiAgICB9KVxuXG4gICAgLy8gSWYgbm8gc2V0dGluZ3MgZXhpc3QsIHJldHVybiBkZWZhdWx0c1xuICAgIGlmIChtZW51U2V0dGluZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zdCBkZWZhdWx0TWVudUl0ZW1zID0gW1xuICAgICAgICB7IGlkOiAnZGFzaGJvYXJkJywgbGFiZWw6ICdEYXNoYm9hcmQnLCBwYXRoOiAnL2Rhc2hib2FyZCcsIGljb246ICdIb21lJywgZW5hYmxlZDogdHJ1ZSwgcG9zaXRpb246IDAgfSxcbiAgICAgICAgeyBpZDogJ3RpbWVsaW5lJywgbGFiZWw6ICdUaW1lbGluZScsIHBhdGg6ICcvZGFzaGJvYXJkL3RpbWVsaW5lJywgaWNvbjogJ01lc3NhZ2VTcXVhcmUnLCBlbmFibGVkOiB0cnVlLCBwb3NpdGlvbjogMSB9LFxuICAgICAgICB7IGlkOiAnbWFpbCcsIGxhYmVsOiAnTWFpbCcsIHBhdGg6ICcvZGFzaGJvYXJkL21haWwnLCBpY29uOiAnTWFpbCcsIGVuYWJsZWQ6IHRydWUsIHBvc2l0aW9uOiAyIH0sXG4gICAgICAgIHsgaWQ6ICdhZ2VuZGEnLCBsYWJlbDogJ0FnZW5kYScsIHBhdGg6ICcvZGFzaGJvYXJkL2FnZW5kYScsIGljb246ICdDYWxlbmRhcicsIGVuYWJsZWQ6IHRydWUsIHBvc2l0aW9uOiAzIH0sXG4gICAgICAgIHsgaWQ6ICdiYW5raW5nJywgbGFiZWw6ICdCYW5raW5nJywgcGF0aDogJy9kYXNoYm9hcmQvYmFua2luZycsIGljb246ICdEb2xsYXJTaWduJywgZW5hYmxlZDogdHJ1ZSwgcG9zaXRpb246IDQgfSxcbiAgICAgICAgeyBpZDogJ3NvY2lhbCcsIGxhYmVsOiAnU29jaWFsJywgcGF0aDogJy9kYXNoYm9hcmQvc29jaWFsJywgaWNvbjogJ1VzZXJzJywgZW5hYmxlZDogdHJ1ZSwgcG9zaXRpb246IDUgfSxcbiAgICAgICAgeyBpZDogJ3dlYXRoZXInLCBsYWJlbDogJ1dlYXRoZXInLCBwYXRoOiAnL2Rhc2hib2FyZC93ZWF0aGVyJywgaWNvbjogJ0Nsb3VkJywgZW5hYmxlZDogdHJ1ZSwgcG9zaXRpb246IDYgfSxcbiAgICAgICAgeyBpZDogJ3NldHRpbmdzJywgbGFiZWw6ICdJbnN0ZWxsaW5nZW4nLCBwYXRoOiAnL2Rhc2hib2FyZC9zZXR0aW5ncycsIGljb246ICdTZXR0aW5ncycsIGVuYWJsZWQ6IHRydWUsIHBvc2l0aW9uOiA3IH1cbiAgICAgIF1cbiAgICAgIFxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgbWVudUl0ZW1zOiBkZWZhdWx0TWVudUl0ZW1zIH0pXG4gICAgfVxuXG4gICAgLy8gVHJhbnNmb3JtIHRvIG1hdGNoIGV4cGVjdGVkIGZvcm1hdFxuICAgIGNvbnN0IG1lbnVJdGVtcyA9IG1lbnVTZXR0aW5ncy5tYXAoaXRlbSA9PiAoe1xuICAgICAgaWQ6IGl0ZW0ubWVudUl0ZW0sXG4gICAgICBsYWJlbDogaXRlbS5sYWJlbCxcbiAgICAgIHBhdGg6IGl0ZW0ucGF0aCxcbiAgICAgIGljb246IGl0ZW0uaWNvbiB8fCAnSG9tZScsXG4gICAgICBlbmFibGVkOiBpdGVtLmVuYWJsZWQsXG4gICAgICBwb3NpdGlvbjogaXRlbS5wb3NpdGlvblxuICAgIH0pKVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgbWVudUl0ZW1zIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHVibGljIG1lbnUgc2V0dGluZ3M6JywgZXJyb3IpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBtZW51IHNldHRpbmdzJyB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKVxuICB9XG59Il0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsIkdFVCIsIm1lbnVTZXR0aW5ncyIsImdsb2JhbE1lbnVTZXR0aW5nIiwiZmluZE1hbnkiLCJvcmRlckJ5IiwicG9zaXRpb24iLCJsZW5ndGgiLCJkZWZhdWx0TWVudUl0ZW1zIiwiaWQiLCJsYWJlbCIsInBhdGgiLCJpY29uIiwiZW5hYmxlZCIsImpzb24iLCJtZW51SXRlbXMiLCJtYXAiLCJpdGVtIiwibWVudUl0ZW0iLCJlcnJvciIsImNvbnNvbGUiLCJzdGF0dXMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/settings/menu/public/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) {\n    global.prisma = prisma;\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBOEM7QUFZdkMsTUFBTUMsU0FBU0MsT0FBT0QsTUFBTSxJQUFJLElBQUlELHdEQUFZQSxHQUFHO0FBRTFELElBQUlHLElBQXFDLEVBQUU7SUFDekNELE9BQU9ELE1BQU0sR0FBR0E7QUFDbEI7QUFFQSxpRUFBZUEsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2xpYi9wcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnO1xuXG4vLyBQcmlzbWFDbGllbnQgaXMgYXR0YWNoZWQgdG8gdGhlIGBnbG9iYWxgIG9iamVjdCBpbiBkZXZlbG9wbWVudCB0byBwcmV2ZW50XG4vLyBleGhhdXN0aW5nIHlvdXIgZGF0YWJhc2UgY29ubmVjdGlvbiBsaW1pdC5cbi8vXG4vLyBMZWFybiBtb3JlOiBcbi8vIGh0dHBzOi8vcHJpcy5seS9kL2hlbHAvbmV4dC1qcy1iZXN0LXByYWN0aWNlc1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIHZhciBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbC5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBnbG9iYWwucHJpc21hID0gcHJpc21hO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwcmlzbWE7Il0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsInByaXNtYSIsImdsb2JhbCIsInByb2Nlc3MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute&page=%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute&page=%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_yustintroost_Documents_sites_yustboard_app_api_settings_menu_public_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/settings/menu/public/route.ts */ \"(rsc)/./app/api/settings/menu/public/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/settings/menu/public/route\",\n        pathname: \"/api/settings/menu/public\",\n        filename: \"route\",\n        bundlePath: \"app/api/settings/menu/public/route\"\n    },\n    resolvedPagePath: \"/Users/yustintroost/Documents/sites/yustboard/app/api/settings/menu/public/route.ts\",\n    nextConfigOutput,\n    userland: _Users_yustintroost_Documents_sites_yustboard_app_api_settings_menu_public_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZzZXR0aW5ncyUyRm1lbnUlMkZwdWJsaWMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnNldHRpbmdzJTJGbWVudSUyRnB1YmxpYyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnNldHRpbmdzJTJGbWVudSUyRnB1YmxpYyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNtQztBQUNoSDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvc2V0dGluZ3MvbWVudS9wdWJsaWMvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3NldHRpbmdzL21lbnUvcHVibGljL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvc2V0dGluZ3MvbWVudS9wdWJsaWNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3NldHRpbmdzL21lbnUvcHVibGljL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvc2V0dGluZ3MvbWVudS9wdWJsaWMvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute&page=%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute&page=%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsettings%2Fmenu%2Fpublic%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();