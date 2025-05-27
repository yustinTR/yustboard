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
exports.id = "app/api/drive/route";
exports.ids = ["app/api/drive/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/./node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/github */ \"(rsc)/./node_modules/next-auth/providers/github.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\n\n// For debugging purposes\nconsole.log(\"NextAuth Config:\", {\n    googleId: process.env.GOOGLE_CLIENT_ID ? \"Set\" : \"Not set\",\n    googleSecret: process.env.GOOGLE_CLIENT_SECRET ? \"Set\" : \"Not set\",\n    nextAuthUrl: process.env.NEXTAUTH_URL,\n    nextAuthSecret: process.env.NEXTAUTH_SECRET ? \"Set\" : \"Not set\"\n});\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_4__[\"default\"]),\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_3__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID || \"\",\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET || \"\",\n            authorization: {\n                params: {\n                    scope: \"openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read\",\n                    prompt: \"consent\",\n                    access_type: \"offline\",\n                    response_type: \"code\"\n                }\n            },\n            allowDangerousEmailAccountLinking: true\n        }),\n        (0,next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            clientId: process.env.GITHUB_ID || \"\",\n            clientSecret: process.env.GITHUB_SECRET || \"\",\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    callbacks: {\n        async signIn ({ user, account, profile }) {\n            console.log(\"SignIn callback:\", {\n                user: user ? {\n                    id: user.id,\n                    name: user.name,\n                    email: user.email\n                } : null,\n                account: account ? {\n                    provider: account.provider,\n                    type: account.type\n                } : null,\n                profile: profile ? {\n                    email: profile.email\n                } : null\n            });\n            // Allow sign in regardless of whether the account is already linked\n            return true;\n        },\n        async jwt ({ token, user, account, trigger, session }) {\n            // Initial sign in\n            if (account && user) {\n                console.log(\"JWT callback (initial sign in):\", {\n                    provider: account.provider,\n                    accessToken: account.access_token ? \"Provided\" : \"Missing\",\n                    refreshToken: account.refresh_token ? \"Provided\" : \"Missing\",\n                    expiresAt: account.expires_at\n                });\n                return {\n                    ...token,\n                    accessToken: account.access_token,\n                    refreshToken: account.refresh_token,\n                    accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,\n                    userRole: \"user\",\n                    userId: user.id\n                };\n            }\n            // Handle updates\n            if (trigger === 'update' && session) {\n                return {\n                    ...token,\n                    ...session\n                };\n            }\n            // Return previous token if the access token has not expired yet\n            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {\n                console.log(\"JWT callback: Using existing token (not expired)\");\n                return token;\n            }\n            console.log(\"JWT callback: Token may be expired or missing expires time\");\n            return token;\n        },\n        async session ({ session, token }) {\n            // This is now always called with a token, not a user\n            if (token) {\n                console.log(\"Session callback with token:\", {\n                    userId: token.userId,\n                    accessToken: token.accessToken ? \"Provided\" : \"Missing\"\n                });\n                // Add the access token and user ID to the session\n                session.accessToken = token.accessToken;\n                session.user.id = token.userId || token.sub;\n                // Fetch user role from database\n                if (session.user.id) {\n                    const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__[\"default\"].user.findUnique({\n                        where: {\n                            id: session.user.id\n                        },\n                        select: {\n                            role: true\n                        }\n                    });\n                    session.user.role = user?.role || 'USER';\n                }\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    debug: \"development\" === \"development\",\n    secret: process.env.NEXTAUTH_SECRET,\n    session: {\n        strategy: \"jwt\",\n        maxAge: 24 * 60 * 60\n    },\n    logger: {\n        error (code, metadata) {\n            console.error(`NextAuth Error: ${code}`, metadata);\n        },\n        warn (code) {\n            console.warn(`NextAuth Warning: ${code}`);\n        },\n        debug (code, metadata) {\n            console.log(`NextAuth Debug: ${code}`, metadata);\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBaUM7QUFDb0I7QUFDRztBQUNBO0FBQ3RCO0FBRWxDLHlCQUF5QjtBQUN6QkssUUFBUUMsR0FBRyxDQUFDLG9CQUFvQjtJQUM5QkMsVUFBVUMsUUFBUUMsR0FBRyxDQUFDQyxnQkFBZ0IsR0FBRyxRQUFRO0lBQ2pEQyxjQUFjSCxRQUFRQyxHQUFHLENBQUNHLG9CQUFvQixHQUFHLFFBQVE7SUFDekRDLGFBQWFMLFFBQVFDLEdBQUcsQ0FBQ0ssWUFBWTtJQUNyQ0MsZ0JBQWdCUCxRQUFRQyxHQUFHLENBQUNPLGVBQWUsR0FBRyxRQUFRO0FBQ3hEO0FBRU8sTUFBTUMsY0FBYztJQUN6QkMsU0FBU2pCLG1FQUFhQSxDQUFDRyxtREFBTUE7SUFDN0JlLFdBQVc7UUFDVGhCLHNFQUFjQSxDQUFDO1lBQ2JpQixVQUFVWixRQUFRQyxHQUFHLENBQUNDLGdCQUFnQixJQUFJO1lBQzFDVyxjQUFjYixRQUFRQyxHQUFHLENBQUNHLG9CQUFvQixJQUFJO1lBQ2xEVSxlQUFlO2dCQUNiQyxRQUFRO29CQUNOQyxPQUFPO29CQUNQQyxRQUFRO29CQUNSQyxhQUFhO29CQUNiQyxlQUFlO2dCQUNqQjtZQUNGO1lBQ0FDLG1DQUFtQztRQUNyQztRQUNBMUIsc0VBQWNBLENBQUM7WUFDYmtCLFVBQVVaLFFBQVFDLEdBQUcsQ0FBQ29CLFNBQVMsSUFBSTtZQUNuQ1IsY0FBY2IsUUFBUUMsR0FBRyxDQUFDcUIsYUFBYSxJQUFJO1lBQzNDRixtQ0FBbUM7UUFDckM7S0FDRDtJQUNERyxXQUFXO1FBQ1QsTUFBTUMsUUFBTyxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFFO1lBQ3JDOUIsUUFBUUMsR0FBRyxDQUFDLG9CQUFvQjtnQkFDOUIyQixNQUFNQSxPQUFPO29CQUFFRyxJQUFJSCxLQUFLRyxFQUFFO29CQUFFQyxNQUFNSixLQUFLSSxJQUFJ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RUFBRUYsTUFBTTtRQUMxQztRQUNBTCxPQUFNSyxJQUFJLEVBQUVDLFFBQVE7WUFDbEJqRSxRQUFRQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRStELE1BQU0sRUFBRUM7UUFDekM7SUFDRjtBQUNGLEVBQUU7QUFFRixNQUFNRSxVQUFVeEUsZ0RBQVFBLENBQUNpQjtBQUVrQiIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgeyBQcmlzbWFBZGFwdGVyIH0gZnJvbSBcIkBhdXRoL3ByaXNtYS1hZGFwdGVyXCI7XG5pbXBvcnQgR2l0aHViUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ2l0aHViXCI7XG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlXCI7XG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcblxuLy8gRm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xuY29uc29sZS5sb2coXCJOZXh0QXV0aCBDb25maWc6XCIsIHtcbiAgZ29vZ2xlSWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG4gIGdvb2dsZVNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG4gIG5leHRBdXRoVXJsOiBwcm9jZXNzLmVudi5ORVhUQVVUSF9VUkwsXG4gIG5leHRBdXRoU2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG59KTtcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zID0ge1xuICBhZGFwdGVyOiBQcmlzbWFBZGFwdGVyKHByaXNtYSksXG4gIHByb3ZpZGVyczogW1xuICAgIEdvb2dsZVByb3ZpZGVyKHtcbiAgICAgIGNsaWVudElkOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEIHx8IFwiXCIsXG4gICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUIHx8IFwiXCIsXG4gICAgICBhdXRob3JpemF0aW9uOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIHNjb3BlOiBcIm9wZW5pZCBlbWFpbCBwcm9maWxlIGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvY2FsZW5kYXIgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9jYWxlbmRhci5ldmVudHMgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5yZWFkb25seSBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLm1ldGFkYXRhLnJlYWRvbmx5IGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZ21haWwucmVhZG9ubHkgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5sYWJlbHMgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9maXRuZXNzLmFjdGl2aXR5LnJlYWQgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9maXRuZXNzLmJvZHkucmVhZFwiLFxuICAgICAgICAgIHByb21wdDogXCJjb25zZW50XCIsXG4gICAgICAgICAgYWNjZXNzX3R5cGU6IFwib2ZmbGluZVwiLFxuICAgICAgICAgIHJlc3BvbnNlX3R5cGU6IFwiY29kZVwiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXG4gICAgfSksXG4gICAgR2l0aHViUHJvdmlkZXIoe1xuICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkdJVEhVQl9JRCB8fCBcIlwiLFxuICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HSVRIVUJfU0VDUkVUIHx8IFwiXCIsXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIsIGFjY291bnQsIHByb2ZpbGUgfSkge1xuICAgICAgY29uc29sZS5sb2coXCJTaWduSW4gY2FsbGJhY2s6XCIsIHsgXG4gICAgICAgIHVzZXI6IHVzZXIgPyB7IGlkOiB1c2VyLmlkLCBuYW1lOiB1c2VyLm5hbWUsIGVtYWlsOiB1c2VyLmVtYWlsIH0gOiBudWxsLFxuICAgICAgICBhY2NvdW50OiBhY2NvdW50ID8geyBwcm92aWRlcjogYWNjb3VudC5wcm92aWRlciwgdHlwZTogYWNjb3VudC50eXBlIH0gOiBudWxsLFxuICAgICAgICBwcm9maWxlOiBwcm9maWxlID8geyBlbWFpbDogcHJvZmlsZS5lbWFpbCB9IDogbnVsbCxcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBBbGxvdyBzaWduIGluIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgYWNjb3VudCBpcyBhbHJlYWR5IGxpbmtlZFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciwgYWNjb3VudCwgdHJpZ2dlciwgc2Vzc2lvbiB9KSB7XG4gICAgICAvLyBJbml0aWFsIHNpZ24gaW5cbiAgICAgIGlmIChhY2NvdW50ICYmIHVzZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2sgKGluaXRpYWwgc2lnbiBpbik6XCIsIHtcbiAgICAgICAgICBwcm92aWRlcjogYWNjb3VudC5wcm92aWRlcixcbiAgICAgICAgICBhY2Nlc3NUb2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4gPyBcIlByb3ZpZGVkXCIgOiBcIk1pc3NpbmdcIixcbiAgICAgICAgICByZWZyZXNoVG9rZW46IGFjY291bnQucmVmcmVzaF90b2tlbiA/IFwiUHJvdmlkZWRcIiA6IFwiTWlzc2luZ1wiLFxuICAgICAgICAgIGV4cGlyZXNBdDogYWNjb3VudC5leHBpcmVzX2F0LFxuICAgICAgICB9KTtcblxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi50b2tlbixcbiAgICAgICAgICBhY2Nlc3NUb2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgcmVmcmVzaFRva2VuOiBhY2NvdW50LnJlZnJlc2hfdG9rZW4sXG4gICAgICAgICAgYWNjZXNzVG9rZW5FeHBpcmVzOiBhY2NvdW50LmV4cGlyZXNfYXQgPyBhY2NvdW50LmV4cGlyZXNfYXQgKiAxMDAwIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHVzZXJSb2xlOiBcInVzZXJcIixcbiAgICAgICAgICB1c2VySWQ6IHVzZXIuaWQsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSB1cGRhdGVzXG4gICAgICBpZiAodHJpZ2dlciA9PT0gJ3VwZGF0ZScgJiYgc2Vzc2lvbikge1xuICAgICAgICByZXR1cm4geyAuLi50b2tlbiwgLi4uc2Vzc2lvbiB9O1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gcHJldmlvdXMgdG9rZW4gaWYgdGhlIGFjY2VzcyB0b2tlbiBoYXMgbm90IGV4cGlyZWQgeWV0XG4gICAgICBpZiAodG9rZW4uYWNjZXNzVG9rZW5FeHBpcmVzICYmIERhdGUubm93KCkgPCB0b2tlbi5hY2Nlc3NUb2tlbkV4cGlyZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2s6IFVzaW5nIGV4aXN0aW5nIHRva2VuIChub3QgZXhwaXJlZClcIik7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2s6IFRva2VuIG1heSBiZSBleHBpcmVkIG9yIG1pc3NpbmcgZXhwaXJlcyB0aW1lXCIpO1xuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIC8vIFRoaXMgaXMgbm93IGFsd2F5cyBjYWxsZWQgd2l0aCBhIHRva2VuLCBub3QgYSB1c2VyXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXNzaW9uIGNhbGxiYWNrIHdpdGggdG9rZW46XCIsIHsgXG4gICAgICAgICAgdXNlcklkOiB0b2tlbi51c2VySWQsXG4gICAgICAgICAgYWNjZXNzVG9rZW46IHRva2VuLmFjY2Vzc1Rva2VuID8gXCJQcm92aWRlZFwiIDogXCJNaXNzaW5nXCIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgYWNjZXNzIHRva2VuIGFuZCB1c2VyIElEIHRvIHRoZSBzZXNzaW9uXG4gICAgICAgIHNlc3Npb24uYWNjZXNzVG9rZW4gPSB0b2tlbi5hY2Nlc3NUb2tlbjtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4udXNlcklkIHx8IHRva2VuLnN1YjtcbiAgICAgICAgXG4gICAgICAgIC8vIEZldGNoIHVzZXIgcm9sZSBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGlmIChzZXNzaW9uLnVzZXIuaWQpIHtcbiAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgICAgICB3aGVyZTogeyBpZDogc2Vzc2lvbi51c2VyLmlkIH0sXG4gICAgICAgICAgICBzZWxlY3Q6IHsgcm9sZTogdHJ1ZSB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB1c2VyPy5yb2xlIHx8ICdVU0VSJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogXCIvbG9naW5cIixcbiAgICBlcnJvcjogXCIvbG9naW5cIiwgLy8gRXJyb3IgcGFnZVxuICB9LFxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIixcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogXCJqd3RcIiwgLy8gSW1wb3J0YW50OiB1c2UgSldUIHN0cmF0ZWd5IHRvIG1ha2UgdGhlIHRva2VuIGF2YWlsYWJsZVxuICAgIG1heEFnZTogMjQgKiA2MCAqIDYwLCAvLyAyNCBob3Vyc1xuICB9LFxuICBsb2dnZXI6IHtcbiAgICBlcnJvcihjb2RlLCBtZXRhZGF0YSkge1xuICAgICAgY29uc29sZS5lcnJvcihgTmV4dEF1dGggRXJyb3I6ICR7Y29kZX1gLCBtZXRhZGF0YSk7XG4gICAgfSxcbiAgICB3YXJuKGNvZGUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgTmV4dEF1dGggV2FybmluZzogJHtjb2RlfWApO1xuICAgIH0sXG4gICAgZGVidWcoY29kZSwgbWV0YWRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBOZXh0QXV0aCBEZWJ1ZzogJHtjb2RlfWAsIG1ldGFkYXRhKTtcbiAgICB9LFxuICB9LFxufTtcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcblxuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9OyJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIlByaXNtYUFkYXB0ZXIiLCJHaXRodWJQcm92aWRlciIsIkdvb2dsZVByb3ZpZGVyIiwicHJpc21hIiwiY29uc29sZSIsImxvZyIsImdvb2dsZUlkIiwicHJvY2VzcyIsImVudiIsIkdPT0dMRV9DTElFTlRfSUQiLCJnb29nbGVTZWNyZXQiLCJHT09HTEVfQ0xJRU5UX1NFQ1JFVCIsIm5leHRBdXRoVXJsIiwiTkVYVEFVVEhfVVJMIiwibmV4dEF1dGhTZWNyZXQiLCJORVhUQVVUSF9TRUNSRVQiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJwcm92aWRlcnMiLCJjbGllbnRJZCIsImNsaWVudFNlY3JldCIsImF1dGhvcml6YXRpb24iLCJwYXJhbXMiLCJzY29wZSIsInByb21wdCIsImFjY2Vzc190eXBlIiwicmVzcG9uc2VfdHlwZSIsImFsbG93RGFuZ2Vyb3VzRW1haWxBY2NvdW50TGlua2luZyIsIkdJVEhVQl9JRCIsIkdJVEhVQl9TRUNSRVQiLCJjYWxsYmFja3MiLCJzaWduSW4iLCJ1c2VyIiwiYWNjb3VudCIsInByb2ZpbGUiLCJpZCIsIm5hbWUiLCJlbWFpbCIsInByb3ZpZGVyIiwidHlwZSIsImp3dCIsInRva2VuIiwidHJpZ2dlciIsInNlc3Npb24iLCJhY2Nlc3NUb2tlbiIsImFjY2Vzc190b2tlbiIsInJlZnJlc2hUb2tlbiIsInJlZnJlc2hfdG9rZW4iLCJleHBpcmVzQXQiLCJleHBpcmVzX2F0IiwiYWNjZXNzVG9rZW5FeHBpcmVzIiwidW5kZWZpbmVkIiwidXNlclJvbGUiLCJ1c2VySWQiLCJEYXRlIiwibm93Iiwic3ViIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwic2VsZWN0Iiwicm9sZSIsInBhZ2VzIiwiZXJyb3IiLCJkZWJ1ZyIsInNlY3JldCIsInN0cmF0ZWd5IiwibWF4QWdlIiwibG9nZ2VyIiwiY29kZSIsIm1ldGFkYXRhIiwid2FybiIsImhhbmRsZXIiLCJHRVQiLCJQT1NUIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/drive/route.ts":
/*!********************************!*\
  !*** ./app/api/drive/route.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _app_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/app/api/auth/[...nextauth]/route */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n/* harmony import */ var _utils_google_drive__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/google-drive */ \"(rsc)/./utils/google-drive.ts\");\n\n\n\n\nasync function GET(request) {\n    try {\n        // Get the user's session\n        const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_app_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        console.log('Drive API - Session check:', {\n            hasSession: !!session,\n            hasAccessToken: !!session?.accessToken,\n            userId: session?.user?.id\n        });\n        if (!session?.accessToken) {\n            console.error('Drive API - No access token in session');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Unauthorized - No access token available. Please sign out and sign in again.'\n            }, {\n                status: 401\n            });\n        }\n        // Parse query parameters\n        const { searchParams } = new URL(request.url);\n        const maxResults = searchParams.get('max') ? parseInt(searchParams.get('max'), 10) : 10;\n        const type = searchParams.get('type') || 'recent';\n        // Fetch files based on the requested type\n        let files;\n        if (type === 'shared') {\n            files = await (0,_utils_google_drive__WEBPACK_IMPORTED_MODULE_3__.fetchSharedFiles)(session.accessToken, maxResults);\n        } else {\n            files = await (0,_utils_google_drive__WEBPACK_IMPORTED_MODULE_3__.fetchRecentFiles)(session.accessToken, maxResults);\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            files\n        });\n    } catch (error) {\n        console.error('Error in Google Drive API route:', error);\n        // Check if it's an authentication error\n        if (error instanceof Error && error.message.includes('Invalid Credentials')) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Authentication failed. Please sign out and sign in again to refresh your Google Drive access.'\n            }, {\n                status: 401\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Failed to fetch files',\n            details: error instanceof Error ? error.message : 'Unknown error'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2RyaXZlL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQTJDO0FBQ087QUFDZTtBQUNTO0FBRW5FLGVBQWVLLElBQUlDLE9BQWdCO0lBQ3hDLElBQUk7UUFDRix5QkFBeUI7UUFDekIsTUFBTUMsVUFBVSxNQUFNTixnRUFBZ0JBLENBQUNDLHFFQUFXQTtRQUVsRE0sUUFBUUMsR0FBRyxDQUFDLDhCQUE4QjtZQUN4Q0MsWUFBWSxDQUFDLENBQUNIO1lBQ2RJLGdCQUFnQixDQUFDLENBQUNKLFNBQVNLO1lBQzNCQyxRQUFRTixTQUFTTyxNQUFNQztRQUN6QjtRQUVBLElBQUksQ0FBQ1IsU0FBU0ssYUFBYTtZQUN6QkosUUFBUVEsS0FBSyxDQUFDO1lBQ2QsT0FBT2hCLHFEQUFZQSxDQUFDaUIsSUFBSSxDQUN0QjtnQkFBRUQsT0FBTztZQUErRSxHQUN4RjtnQkFBRUUsUUFBUTtZQUFJO1FBRWxCO1FBRUEseUJBQXlCO1FBQ3pCLE1BQU0sRUFBRUMsWUFBWSxFQUFFLEdBQUcsSUFBSUMsSUFBSWQsUUFBUWUsR0FBRztRQUM1QyxNQUFNQyxhQUFhSCxhQUFhSSxHQUFHLENBQUMsU0FBU0MsU0FBU0wsYUFBYUksR0FBRyxDQUFDLFFBQWtCLE1BQU07UUFDL0YsTUFBTUUsT0FBT04sYUFBYUksR0FBRyxDQUFDLFdBQVc7UUFFekMsMENBQTBDO1FBQzFDLElBQUlHO1FBQ0osSUFBSUQsU0FBUyxVQUFVO1lBQ3JCQyxRQUFRLE1BQU10QixxRUFBZ0JBLENBQUNHLFFBQVFLLFdBQVcsRUFBRVU7UUFDdEQsT0FBTztZQUNMSSxRQUFRLE1BQU12QixxRUFBZ0JBLENBQUNJLFFBQVFLLFdBQVcsRUFBRVU7UUFDdEQ7UUFFQSxPQUFPdEIscURBQVlBLENBQUNpQixJQUFJLENBQUM7WUFBRVM7UUFBTTtJQUNuQyxFQUFFLE9BQU9WLE9BQU87UUFDZFIsUUFBUVEsS0FBSyxDQUFDLG9DQUFvQ0E7UUFFbEQsd0NBQXdDO1FBQ3hDLElBQUlBLGlCQUFpQlcsU0FBU1gsTUFBTVksT0FBTyxDQUFDQyxRQUFRLENBQUMsd0JBQXdCO1lBQzNFLE9BQU83QixxREFBWUEsQ0FBQ2lCLElBQUksQ0FDdEI7Z0JBQUVELE9BQU87WUFBZ0csR0FDekc7Z0JBQUVFLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE9BQU9sQixxREFBWUEsQ0FBQ2lCLElBQUksQ0FDdEI7WUFBRUQsT0FBTztZQUF5QmMsU0FBU2QsaUJBQWlCVyxRQUFRWCxNQUFNWSxPQUFPLEdBQUc7UUFBZ0IsR0FDcEc7WUFBRVYsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy95dXN0aW50cm9vc3QvRG9jdW1lbnRzL3NpdGVzL3l1c3Rib2FyZC9hcHAvYXBpL2RyaXZlL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgvbmV4dCc7XG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUnO1xuaW1wb3J0IHsgZmV0Y2hSZWNlbnRGaWxlcywgZmV0Y2hTaGFyZWRGaWxlcyB9IGZyb20gJ0AvdXRpbHMvZ29vZ2xlLWRyaXZlJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgLy8gR2V0IHRoZSB1c2VyJ3Mgc2Vzc2lvblxuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnRHJpdmUgQVBJIC0gU2Vzc2lvbiBjaGVjazonLCB7XG4gICAgICBoYXNTZXNzaW9uOiAhIXNlc3Npb24sXG4gICAgICBoYXNBY2Nlc3NUb2tlbjogISFzZXNzaW9uPy5hY2Nlc3NUb2tlbixcbiAgICAgIHVzZXJJZDogc2Vzc2lvbj8udXNlcj8uaWRcbiAgICB9KTtcbiAgICBcbiAgICBpZiAoIXNlc3Npb24/LmFjY2Vzc1Rva2VuKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdEcml2ZSBBUEkgLSBObyBhY2Nlc3MgdG9rZW4gaW4gc2Vzc2lvbicpO1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnVW5hdXRob3JpemVkIC0gTm8gYWNjZXNzIHRva2VuIGF2YWlsYWJsZS4gUGxlYXNlIHNpZ24gb3V0IGFuZCBzaWduIGluIGFnYWluLicgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMSB9XG4gICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvLyBQYXJzZSBxdWVyeSBwYXJhbWV0ZXJzXG4gICAgY29uc3QgeyBzZWFyY2hQYXJhbXMgfSA9IG5ldyBVUkwocmVxdWVzdC51cmwpO1xuICAgIGNvbnN0IG1heFJlc3VsdHMgPSBzZWFyY2hQYXJhbXMuZ2V0KCdtYXgnKSA/IHBhcnNlSW50KHNlYXJjaFBhcmFtcy5nZXQoJ21heCcpIGFzIHN0cmluZywgMTApIDogMTA7XG4gICAgY29uc3QgdHlwZSA9IHNlYXJjaFBhcmFtcy5nZXQoJ3R5cGUnKSB8fCAncmVjZW50JztcbiAgICBcbiAgICAvLyBGZXRjaCBmaWxlcyBiYXNlZCBvbiB0aGUgcmVxdWVzdGVkIHR5cGVcbiAgICBsZXQgZmlsZXM7XG4gICAgaWYgKHR5cGUgPT09ICdzaGFyZWQnKSB7XG4gICAgICBmaWxlcyA9IGF3YWl0IGZldGNoU2hhcmVkRmlsZXMoc2Vzc2lvbi5hY2Nlc3NUb2tlbiwgbWF4UmVzdWx0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbGVzID0gYXdhaXQgZmV0Y2hSZWNlbnRGaWxlcyhzZXNzaW9uLmFjY2Vzc1Rva2VuLCBtYXhSZXN1bHRzKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZmlsZXMgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gR29vZ2xlIERyaXZlIEFQSSByb3V0ZTonLCBlcnJvcik7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgaXQncyBhbiBhdXRoZW50aWNhdGlvbiBlcnJvclxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ0ludmFsaWQgQ3JlZGVudGlhbHMnKSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnQXV0aGVudGljYXRpb24gZmFpbGVkLiBQbGVhc2Ugc2lnbiBvdXQgYW5kIHNpZ24gaW4gYWdhaW4gdG8gcmVmcmVzaCB5b3VyIEdvb2dsZSBEcml2ZSBhY2Nlc3MuJyB9LFxuICAgICAgICB7IHN0YXR1czogNDAxIH1cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZmlsZXMnLCBkZXRhaWxzOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJyB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufSJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJmZXRjaFJlY2VudEZpbGVzIiwiZmV0Y2hTaGFyZWRGaWxlcyIsIkdFVCIsInJlcXVlc3QiLCJzZXNzaW9uIiwiY29uc29sZSIsImxvZyIsImhhc1Nlc3Npb24iLCJoYXNBY2Nlc3NUb2tlbiIsImFjY2Vzc1Rva2VuIiwidXNlcklkIiwidXNlciIsImlkIiwiZXJyb3IiLCJqc29uIiwic3RhdHVzIiwic2VhcmNoUGFyYW1zIiwiVVJMIiwidXJsIiwibWF4UmVzdWx0cyIsImdldCIsInBhcnNlSW50IiwidHlwZSIsImZpbGVzIiwiRXJyb3IiLCJtZXNzYWdlIiwiaW5jbHVkZXMiLCJkZXRhaWxzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/drive/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) {\n    global.prisma = prisma;\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBOEM7QUFZdkMsTUFBTUMsU0FBU0MsT0FBT0QsTUFBTSxJQUFJLElBQUlELHdEQUFZQSxHQUFHO0FBRTFELElBQUlHLElBQXFDLEVBQUU7SUFDekNELE9BQU9ELE1BQU0sR0FBR0E7QUFDbEI7QUFFQSxpRUFBZUEsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2xpYi9wcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnO1xuXG4vLyBQcmlzbWFDbGllbnQgaXMgYXR0YWNoZWQgdG8gdGhlIGBnbG9iYWxgIG9iamVjdCBpbiBkZXZlbG9wbWVudCB0byBwcmV2ZW50XG4vLyBleGhhdXN0aW5nIHlvdXIgZGF0YWJhc2UgY29ubmVjdGlvbiBsaW1pdC5cbi8vXG4vLyBMZWFybiBtb3JlOiBcbi8vIGh0dHBzOi8vcHJpcy5seS9kL2hlbHAvbmV4dC1qcy1iZXN0LXByYWN0aWNlc1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIHZhciBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbC5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBnbG9iYWwucHJpc21hID0gcHJpc21hO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwcmlzbWE7Il0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsInByaXNtYSIsImdsb2JhbCIsInByb2Nlc3MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdrive%2Froute&page=%2Fapi%2Fdrive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdrive%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdrive%2Froute&page=%2Fapi%2Fdrive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdrive%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_yustintroost_Documents_sites_yustboard_app_api_drive_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/drive/route.ts */ \"(rsc)/./app/api/drive/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/drive/route\",\n        pathname: \"/api/drive\",\n        filename: \"route\",\n        bundlePath: \"app/api/drive/route\"\n    },\n    resolvedPagePath: \"/Users/yustintroost/Documents/sites/yustboard/app/api/drive/route.ts\",\n    nextConfigOutput,\n    userland: _Users_yustintroost_Documents_sites_yustboard_app_api_drive_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZkcml2ZSUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGZHJpdmUlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZkcml2ZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNvQjtBQUNqRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvZHJpdmUvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2RyaXZlL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvZHJpdmVcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2RyaXZlL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvZHJpdmUvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdrive%2Froute&page=%2Fapi%2Fdrive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdrive%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./utils/google-drive.ts":
/*!*******************************!*\
  !*** ./utils/google-drive.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   fetchRecentFiles: () => (/* binding */ fetchRecentFiles),\n/* harmony export */   fetchSharedFiles: () => (/* binding */ fetchSharedFiles),\n/* harmony export */   getGoogleDriveClient: () => (/* binding */ getGoogleDriveClient)\n/* harmony export */ });\n/* harmony import */ var googleapis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! googleapis */ \"(rsc)/./node_modules/googleapis/build/src/index.js\");\n\n// Initialize Google Drive API\nasync function getGoogleDriveClient(accessToken) {\n    if (!accessToken) {\n        throw new Error(\"Access token is required for Google Drive API\");\n    }\n    console.log(\"Initializing Google Drive client with access token\");\n    const auth = new googleapis__WEBPACK_IMPORTED_MODULE_0__.google.auth.OAuth2();\n    auth.setCredentials({\n        access_token: accessToken\n    });\n    return googleapis__WEBPACK_IMPORTED_MODULE_0__.google.drive({\n        version: 'v3',\n        auth\n    });\n}\n// Format file size for display\nfunction formatFileSize(bytes) {\n    if (!bytes) return '';\n    const units = [\n        'B',\n        'KB',\n        'MB',\n        'GB',\n        'TB'\n    ];\n    let size = bytes;\n    let unitIndex = 0;\n    while(size >= 1024 && unitIndex < units.length - 1){\n        size /= 1024;\n        unitIndex++;\n    }\n    return `${size.toFixed(1)} ${units[unitIndex]}`;\n}\n// Fetch recent files from Google Drive\nasync function fetchRecentFiles(accessToken, maxResults = 10) {\n    try {\n        console.log(\"Fetching recent Google Drive files...\");\n        console.log(\"Access token present:\", !!accessToken);\n        console.log(\"Access token length:\", accessToken?.length);\n        const drive = await getGoogleDriveClient(accessToken);\n        const response = await drive.files.list({\n            pageSize: maxResults,\n            fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink, owners, shared, size)',\n            orderBy: 'modifiedTime desc',\n            q: 'trashed = false'\n        });\n        console.log(`Received ${response.data.files?.length || 0} files from Google Drive`);\n        if (!response.data.files || response.data.files.length === 0) {\n            return [];\n        }\n        return response.data.files.map((file)=>({\n                id: file.id || '',\n                name: file.name || 'Untitled',\n                mimeType: file.mimeType || '',\n                createdTime: file.createdTime || '',\n                modifiedTime: file.modifiedTime || '',\n                webViewLink: file.webViewLink || '',\n                iconLink: file.iconLink || '',\n                thumbnailLink: file.thumbnailLink,\n                owners: file.owners?.map((owner)=>({\n                        displayName: owner.displayName,\n                        emailAddress: owner.emailAddress || '',\n                        photoLink: owner.photoLink\n                    })) || [],\n                shared: file.shared || false,\n                size: formatFileSize(Number(file.size))\n            }));\n    } catch (error) {\n        console.error('Error fetching Google Drive files:', error);\n        // Show more detailed error information\n        if (error instanceof Error) {\n            console.error('Error message:', error.message);\n            console.error('Error stack:', error.stack);\n        }\n        // Check for specific Google API errors\n        if (error?.response?.status === 401) {\n            console.error('Google Drive API returned 401 Unauthorized');\n            throw new Error('Invalid Credentials');\n        }\n        if (error?.errors?.[0]?.reason === 'authError') {\n            console.error('Google Drive API authentication error');\n            throw new Error('Authentication failed');\n        }\n        // Re-throw the error to handle it in the API route\n        throw error;\n    }\n}\n// Fetch shared files from Google Drive\nasync function fetchSharedFiles(accessToken, maxResults = 10) {\n    try {\n        console.log(\"Fetching shared Google Drive files...\");\n        const drive = await getGoogleDriveClient(accessToken);\n        const response = await drive.files.list({\n            pageSize: maxResults,\n            fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink, owners, shared, size)',\n            orderBy: 'modifiedTime desc',\n            q: 'trashed = false and sharedWithMe = true'\n        });\n        console.log(`Received ${response.data.files?.length || 0} shared files from Google Drive`);\n        if (!response.data.files || response.data.files.length === 0) {\n            return [];\n        }\n        return response.data.files.map((file)=>({\n                id: file.id || '',\n                name: file.name || 'Untitled',\n                mimeType: file.mimeType || '',\n                createdTime: file.createdTime || '',\n                modifiedTime: file.modifiedTime || '',\n                webViewLink: file.webViewLink || '',\n                iconLink: file.iconLink || '',\n                thumbnailLink: file.thumbnailLink,\n                owners: file.owners?.map((owner)=>({\n                        displayName: owner.displayName,\n                        emailAddress: owner.emailAddress || '',\n                        photoLink: owner.photoLink\n                    })) || [],\n                shared: file.shared || false,\n                size: formatFileSize(Number(file.size))\n            }));\n    } catch (error) {\n        console.error('Error fetching shared Google Drive files:', error);\n        // Show more detailed error information\n        if (error instanceof Error) {\n            console.error('Error message:', error.message);\n            console.error('Error stack:', error.stack);\n        }\n        // Check for specific Google API errors\n        if (error?.response?.status === 401) {\n            console.error('Google Drive API returned 401 Unauthorized');\n            throw new Error('Invalid Credentials');\n        }\n        if (error?.errors?.[0]?.reason === 'authError') {\n            console.error('Google Drive API authentication error');\n            throw new Error('Authentication failed');\n        }\n        // Re-throw the error to handle it in the API route\n        throw error;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFBSTtnQkFDbkNDLGFBQWFOLEtBQUtNLFdBQVcsSUFBSTtnQkFDakNDLFVBQVVQLEtBQUtPLFFBQVEsSUFBSTtnQkFDM0JDLGVBQWVSLEtBQUtRLGFBQWE7Z0JBQ2pDQyxRQUFRVCxLQUFLUyxNQUFNLEVBQUVWLElBQUlXLENBQUFBLFFBQVU7d0JBQ2pDQyxhQUFhRCxNQUFNQyxXQUFXO3dCQUM5QkMsY0FBY0YsTUFBTUUsWUFBWSxJQUFJO3dCQUNwQ0MsV0FBV0gsTUFBTUcsU0FBUztvQkFDNUIsT0FBTyxFQUFFO2dCQUNUQyxRQUFRZCxLQUFLYyxNQUFNLElBQUk7Z0JBQ3ZCN0IsTUFBTUgsZUFBZWlDLE9BQU9mLEtBQUtmLElBQUk7WUFDdkM7SUFDRixFQUFFLE9BQU8rQixPQUFZO1FBQ25CMUMsUUFBUTBDLEtBQUssQ0FBQyw2Q0FBNkNBO1FBRTNELHVDQUF1QztRQUN2QyxJQUFJQSxpQkFBaUIzQyxPQUFPO1lBQzFCQyxRQUFRMEMsS0FBSyxDQUFDLGtCQUFrQkEsTUFBTUMsT0FBTztZQUM3QzNDLFFBQVEwQyxLQUFLLENBQUMsZ0JBQWdCQSxNQUFNRSxLQUFLO1FBQzNDO1FBRUEsdUNBQXVDO1FBQ3ZDLElBQUlGLE9BQU96QixVQUFVNEIsV0FBVyxLQUFLO1lBQ25DN0MsUUFBUTBDLEtBQUssQ0FBQztZQUNkLE1BQU0sSUFBSTNDLE1BQU07UUFDbEI7UUFFQSxJQUFJMkMsT0FBT0ksUUFBUSxDQUFDLEVBQUUsRUFBRUMsV0FBVyxhQUFhO1lBQzlDL0MsUUFBUTBDLEtBQUssQ0FBQztZQUNkLE1BQU0sSUFBSTNDLE1BQU07UUFDbEI7UUFFQSxtREFBbUQ7UUFDbkQsTUFBTTJDO0lBQ1I7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL3V0aWxzL2dvb2dsZS1kcml2ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnb29nbGUgfSBmcm9tICdnb29nbGVhcGlzJztcblxuZXhwb3J0IGludGVyZmFjZSBEcml2ZUZpbGUge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIG1pbWVUeXBlOiBzdHJpbmc7XG4gIGNyZWF0ZWRUaW1lOiBzdHJpbmc7XG4gIG1vZGlmaWVkVGltZTogc3RyaW5nO1xuICB3ZWJWaWV3TGluazogc3RyaW5nO1xuICBpY29uTGluazogc3RyaW5nO1xuICB0aHVtYm5haWxMaW5rPzogc3RyaW5nO1xuICBvd25lcnM6IEFycmF5PHtcbiAgICBkaXNwbGF5TmFtZT86IHN0cmluZztcbiAgICBlbWFpbEFkZHJlc3M6IHN0cmluZztcbiAgICBwaG90b0xpbms/OiBzdHJpbmc7XG4gIH0+O1xuICBzaGFyZWQ6IGJvb2xlYW47XG4gIHNpemU/OiBzdHJpbmc7XG59XG5cbi8vIEluaXRpYWxpemUgR29vZ2xlIERyaXZlIEFQSVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEdvb2dsZURyaXZlQ2xpZW50KGFjY2Vzc1Rva2VuOiBzdHJpbmcpIHtcbiAgaWYgKCFhY2Nlc3NUb2tlbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkFjY2VzcyB0b2tlbiBpcyByZXF1aXJlZCBmb3IgR29vZ2xlIERyaXZlIEFQSVwiKTtcbiAgfVxuICBcbiAgY29uc29sZS5sb2coXCJJbml0aWFsaXppbmcgR29vZ2xlIERyaXZlIGNsaWVudCB3aXRoIGFjY2VzcyB0b2tlblwiKTtcbiAgY29uc3QgYXV0aCA9IG5ldyBnb29nbGUuYXV0aC5PQXV0aDIoKTtcbiAgYXV0aC5zZXRDcmVkZW50aWFscyh7IGFjY2Vzc190b2tlbjogYWNjZXNzVG9rZW4gfSk7XG4gIHJldHVybiBnb29nbGUuZHJpdmUoeyB2ZXJzaW9uOiAndjMnLCBhdXRoIH0pO1xufVxuXG4vLyBGb3JtYXQgZmlsZSBzaXplIGZvciBkaXNwbGF5XG5mdW5jdGlvbiBmb3JtYXRGaWxlU2l6ZShieXRlcz86IG51bWJlcik6IHN0cmluZyB7XG4gIGlmICghYnl0ZXMpIHJldHVybiAnJztcbiAgXG4gIGNvbnN0IHVuaXRzID0gWydCJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJ107XG4gIGxldCBzaXplID0gYnl0ZXM7XG4gIGxldCB1bml0SW5kZXggPSAwO1xuICBcbiAgd2hpbGUgKHNpemUgPj0gMTAyNCAmJiB1bml0SW5kZXggPCB1bml0cy5sZW5ndGggLSAxKSB7XG4gICAgc2l6ZSAvPSAxMDI0O1xuICAgIHVuaXRJbmRleCsrO1xuICB9XG4gIFxuICByZXR1cm4gYCR7c2l6ZS50b0ZpeGVkKDEpfSAke3VuaXRzW3VuaXRJbmRleF19YDtcbn1cblxuLy8gRmV0Y2ggcmVjZW50IGZpbGVzIGZyb20gR29vZ2xlIERyaXZlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hSZWNlbnRGaWxlcyhhY2Nlc3NUb2tlbjogc3RyaW5nLCBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMCk6IFByb21pc2U8RHJpdmVGaWxlW10+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhcIkZldGNoaW5nIHJlY2VudCBHb29nbGUgRHJpdmUgZmlsZXMuLi5cIik7XG4gICAgY29uc29sZS5sb2coXCJBY2Nlc3MgdG9rZW4gcHJlc2VudDpcIiwgISFhY2Nlc3NUb2tlbik7XG4gICAgY29uc29sZS5sb2coXCJBY2Nlc3MgdG9rZW4gbGVuZ3RoOlwiLCBhY2Nlc3NUb2tlbj8ubGVuZ3RoKTtcbiAgICBcbiAgICBjb25zdCBkcml2ZSA9IGF3YWl0IGdldEdvb2dsZURyaXZlQ2xpZW50KGFjY2Vzc1Rva2VuKTtcbiAgICBcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGRyaXZlLmZpbGVzLmxpc3Qoe1xuICAgICAgcGFnZVNpemU6IG1heFJlc3VsdHMsXG4gICAgICBmaWVsZHM6ICdmaWxlcyhpZCwgbmFtZSwgbWltZVR5cGUsIGNyZWF0ZWRUaW1lLCBtb2RpZmllZFRpbWUsIHdlYlZpZXdMaW5rLCBpY29uTGluaywgdGh1bWJuYWlsTGluaywgb3duZXJzLCBzaGFyZWQsIHNpemUpJyxcbiAgICAgIG9yZGVyQnk6ICdtb2RpZmllZFRpbWUgZGVzYycsXG4gICAgICBxOiAndHJhc2hlZCA9IGZhbHNlJyxcbiAgICB9KTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgUmVjZWl2ZWQgJHtyZXNwb25zZS5kYXRhLmZpbGVzPy5sZW5ndGggfHwgMH0gZmlsZXMgZnJvbSBHb29nbGUgRHJpdmVgKTtcbiAgICBcbiAgICBpZiAoIXJlc3BvbnNlLmRhdGEuZmlsZXMgfHwgcmVzcG9uc2UuZGF0YS5maWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuZmlsZXMubWFwKGZpbGUgPT4gKHtcbiAgICAgIGlkOiBmaWxlLmlkIHx8ICcnLFxuICAgICAgbmFtZTogZmlsZS5uYW1lIHx8ICdVbnRpdGxlZCcsXG4gICAgICBtaW1lVHlwZTogZmlsZS5taW1lVHlwZSB8fCAnJyxcbiAgICAgIGNyZWF0ZWRUaW1lOiBmaWxlLmNyZWF0ZWRUaW1lIHx8ICcnLFxuICAgICAgbW9kaWZpZWRUaW1lOiBmaWxlLm1vZGlmaWVkVGltZSB8fCAnJyxcbiAgICAgIHdlYlZpZXdMaW5rOiBmaWxlLndlYlZpZXdMaW5rIHx8ICcnLFxuICAgICAgaWNvbkxpbms6IGZpbGUuaWNvbkxpbmsgfHwgJycsXG4gICAgICB0aHVtYm5haWxMaW5rOiBmaWxlLnRodW1ibmFpbExpbmssXG4gICAgICBvd25lcnM6IGZpbGUub3duZXJzPy5tYXAob3duZXIgPT4gKHtcbiAgICAgICAgZGlzcGxheU5hbWU6IG93bmVyLmRpc3BsYXlOYW1lLFxuICAgICAgICBlbWFpbEFkZHJlc3M6IG93bmVyLmVtYWlsQWRkcmVzcyB8fCAnJyxcbiAgICAgICAgcGhvdG9MaW5rOiBvd25lci5waG90b0xpbmtcbiAgICAgIH0pKSB8fCBbXSxcbiAgICAgIHNoYXJlZDogZmlsZS5zaGFyZWQgfHwgZmFsc2UsXG4gICAgICBzaXplOiBmb3JtYXRGaWxlU2l6ZShOdW1iZXIoZmlsZS5zaXplKSlcbiAgICB9KSk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBHb29nbGUgRHJpdmUgZmlsZXM6JywgZXJyb3IpO1xuICAgIFxuICAgIC8vIFNob3cgbW9yZSBkZXRhaWxlZCBlcnJvciBpbmZvcm1hdGlvblxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBtZXNzYWdlOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc3RhY2s6JywgZXJyb3Iuc3RhY2spO1xuICAgIH1cbiAgICBcbiAgICAvLyBDaGVjayBmb3Igc3BlY2lmaWMgR29vZ2xlIEFQSSBlcnJvcnNcbiAgICBpZiAoZXJyb3I/LnJlc3BvbnNlPy5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgY29uc29sZS5lcnJvcignR29vZ2xlIERyaXZlIEFQSSByZXR1cm5lZCA0MDEgVW5hdXRob3JpemVkJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgQ3JlZGVudGlhbHMnKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGVycm9yPy5lcnJvcnM/LlswXT8ucmVhc29uID09PSAnYXV0aEVycm9yJykge1xuICAgICAgY29uc29sZS5lcnJvcignR29vZ2xlIERyaXZlIEFQSSBhdXRoZW50aWNhdGlvbiBlcnJvcicpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdXRoZW50aWNhdGlvbiBmYWlsZWQnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUmUtdGhyb3cgdGhlIGVycm9yIHRvIGhhbmRsZSBpdCBpbiB0aGUgQVBJIHJvdXRlXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLy8gRmV0Y2ggc2hhcmVkIGZpbGVzIGZyb20gR29vZ2xlIERyaXZlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hTaGFyZWRGaWxlcyhhY2Nlc3NUb2tlbjogc3RyaW5nLCBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMCk6IFByb21pc2U8RHJpdmVGaWxlW10+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhcIkZldGNoaW5nIHNoYXJlZCBHb29nbGUgRHJpdmUgZmlsZXMuLi5cIik7XG4gICAgY29uc3QgZHJpdmUgPSBhd2FpdCBnZXRHb29nbGVEcml2ZUNsaWVudChhY2Nlc3NUb2tlbik7XG4gICAgXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBkcml2ZS5maWxlcy5saXN0KHtcbiAgICAgIHBhZ2VTaXplOiBtYXhSZXN1bHRzLFxuICAgICAgZmllbGRzOiAnZmlsZXMoaWQsIG5hbWUsIG1pbWVUeXBlLCBjcmVhdGVkVGltZSwgbW9kaWZpZWRUaW1lLCB3ZWJWaWV3TGluaywgaWNvbkxpbmssIHRodW1ibmFpbExpbmssIG93bmVycywgc2hhcmVkLCBzaXplKScsXG4gICAgICBvcmRlckJ5OiAnbW9kaWZpZWRUaW1lIGRlc2MnLFxuICAgICAgcTogJ3RyYXNoZWQgPSBmYWxzZSBhbmQgc2hhcmVkV2l0aE1lID0gdHJ1ZScsXG4gICAgfSk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFJlY2VpdmVkICR7cmVzcG9uc2UuZGF0YS5maWxlcz8ubGVuZ3RoIHx8IDB9IHNoYXJlZCBmaWxlcyBmcm9tIEdvb2dsZSBEcml2ZWApO1xuICAgIFxuICAgIGlmICghcmVzcG9uc2UuZGF0YS5maWxlcyB8fCByZXNwb25zZS5kYXRhLmZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5maWxlcy5tYXAoZmlsZSA9PiAoe1xuICAgICAgaWQ6IGZpbGUuaWQgfHwgJycsXG4gICAgICBuYW1lOiBmaWxlLm5hbWUgfHwgJ1VudGl0bGVkJyxcbiAgICAgIG1pbWVUeXBlOiBmaWxlLm1pbWVUeXBlIHx8ICcnLFxuICAgICAgY3JlYXRlZFRpbWU6IGZpbGUuY3JlYXRlZFRpbWUgfHwgJycsXG4gICAgICBtb2RpZmllZFRpbWU6IGZpbGUubW9kaWZpZWRUaW1lIHx8ICcnLFxuICAgICAgd2ViVmlld0xpbms6IGZpbGUud2ViVmlld0xpbmsgfHwgJycsXG4gICAgICBpY29uTGluazogZmlsZS5pY29uTGluayB8fCAnJyxcbiAgICAgIHRodW1ibmFpbExpbms6IGZpbGUudGh1bWJuYWlsTGluayxcbiAgICAgIG93bmVyczogZmlsZS5vd25lcnM/Lm1hcChvd25lciA9PiAoe1xuICAgICAgICBkaXNwbGF5TmFtZTogb3duZXIuZGlzcGxheU5hbWUsXG4gICAgICAgIGVtYWlsQWRkcmVzczogb3duZXIuZW1haWxBZGRyZXNzIHx8ICcnLFxuICAgICAgICBwaG90b0xpbms6IG93bmVyLnBob3RvTGlua1xuICAgICAgfSkpIHx8IFtdLFxuICAgICAgc2hhcmVkOiBmaWxlLnNoYXJlZCB8fCBmYWxzZSxcbiAgICAgIHNpemU6IGZvcm1hdEZpbGVTaXplKE51bWJlcihmaWxlLnNpemUpKVxuICAgIH0pKTtcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHNoYXJlZCBHb29nbGUgRHJpdmUgZmlsZXM6JywgZXJyb3IpO1xuICAgIFxuICAgIC8vIFNob3cgbW9yZSBkZXRhaWxlZCBlcnJvciBpbmZvcm1hdGlvblxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBtZXNzYWdlOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc3RhY2s6JywgZXJyb3Iuc3RhY2spO1xuICAgIH1cbiAgICBcbiAgICAvLyBDaGVjayBmb3Igc3BlY2lmaWMgR29vZ2xlIEFQSSBlcnJvcnNcbiAgICBpZiAoZXJyb3I/LnJlc3BvbnNlPy5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgY29uc29sZS5lcnJvcignR29vZ2xlIERyaXZlIEFQSSByZXR1cm5lZCA0MDEgVW5hdXRob3JpemVkJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgQ3JlZGVudGlhbHMnKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGVycm9yPy5lcnJvcnM/LlswXT8ucmVhc29uID09PSAnYXV0aEVycm9yJykge1xuICAgICAgY29uc29sZS5lcnJvcignR29vZ2xlIERyaXZlIEFQSSBhdXRoZW50aWNhdGlvbiBlcnJvcicpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdXRoZW50aWNhdGlvbiBmYWlsZWQnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUmUtdGhyb3cgdGhlIGVycm9yIHRvIGhhbmRsZSBpdCBpbiB0aGUgQVBJIHJvdXRlXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn0iXSwibmFtZXMiOlsiZ29vZ2xlIiwiZ2V0R29vZ2xlRHJpdmVDbGllbnQiLCJhY2Nlc3NUb2tlbiIsIkVycm9yIiwiY29uc29sZSIsImxvZyIsImF1dGgiLCJPQXV0aDIiLCJzZXRDcmVkZW50aWFscyIsImFjY2Vzc190b2tlbiIsImRyaXZlIiwidmVyc2lvbiIsImZvcm1hdEZpbGVTaXplIiwiYnl0ZXMiLCJ1bml0cyIsInNpemUiLCJ1bml0SW5kZXgiLCJsZW5ndGgiLCJ0b0ZpeGVkIiwiZmV0Y2hSZWNlbnRGaWxlcyIsIm1heFJlc3VsdHMiLCJyZXNwb25zZSIsImZpbGVzIiwibGlzdCIsInBhZ2VTaXplIiwiZmllbGRzIiwib3JkZXJCeSIsInEiLCJkYXRhIiwibWFwIiwiZmlsZSIsImlkIiwibmFtZSIsIm1pbWVUeXBlIiwiY3JlYXRlZFRpbWUiLCJtb2RpZmllZFRpbWUiLCJ3ZWJWaWV3TGluayIsImljb25MaW5rIiwidGh1bWJuYWlsTGluayIsIm93bmVycyIsIm93bmVyIiwiZGlzcGxheU5hbWUiLCJlbWFpbEFkZHJlc3MiLCJwaG90b0xpbmsiLCJzaGFyZWQiLCJOdW1iZXIiLCJlcnJvciIsIm1lc3NhZ2UiLCJzdGFjayIsInN0YXR1cyIsImVycm9ycyIsInJlYXNvbiIsImZldGNoU2hhcmVkRmlsZXMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./utils/google-drive.ts\n");

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

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "http2":
/*!************************!*\
  !*** external "http2" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("http2");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

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

/***/ }),

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("process");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/lru-cache","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/cookie","vendor-chunks/@auth","vendor-chunks/oidc-token-hash","vendor-chunks/@panva","vendor-chunks/googleapis","vendor-chunks/google-auth-library","vendor-chunks/tr46","vendor-chunks/bignumber.js","vendor-chunks/googleapis-common","vendor-chunks/gaxios","vendor-chunks/node-fetch","vendor-chunks/whatwg-url","vendor-chunks/qs","vendor-chunks/json-bigint","vendor-chunks/google-logging-utils","vendor-chunks/object-inspect","vendor-chunks/gcp-metadata","vendor-chunks/debug","vendor-chunks/get-intrinsic","vendor-chunks/https-proxy-agent","vendor-chunks/gtoken","vendor-chunks/agent-base","vendor-chunks/jws","vendor-chunks/jwa","vendor-chunks/url-template","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/webidl-conversions","vendor-chunks/base64-js","vendor-chunks/side-channel-list","vendor-chunks/extend","vendor-chunks/ms","vendor-chunks/supports-color","vendor-chunks/side-channel-weakmap","vendor-chunks/has-symbols","vendor-chunks/function-bind","vendor-chunks/side-channel-map","vendor-chunks/safe-buffer","vendor-chunks/side-channel","vendor-chunks/get-proto","vendor-chunks/call-bind-apply-helpers","vendor-chunks/buffer-equal-constant-time","vendor-chunks/dunder-proto","vendor-chunks/math-intrinsics","vendor-chunks/call-bound","vendor-chunks/is-stream","vendor-chunks/es-errors","vendor-chunks/has-flag","vendor-chunks/gopd","vendor-chunks/es-define-property","vendor-chunks/hasown","vendor-chunks/es-object-atoms"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdrive%2Froute&page=%2Fapi%2Fdrive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdrive%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();