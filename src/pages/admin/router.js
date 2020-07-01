import Vue from 'vue'
import VueRouter from 'vue-router'
// 引入 view 组件
import { Announcement, Conf, Contest, ContestList, Home, JudgeServer, Login, CourseList, CourseContestList,
  Problem, ProblemList, User, PruneTestCase, Dashboard, ProblemImportOrExport, CourseUserRequestList, CourseUserList } from './views'
Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: '/admin/',
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Dashboard
        },
        {
          path: '/announcement',
          name: 'announcement',
          component: Announcement
        },
        {
          path: '/user',
          name: 'user',
          component: User
        },
        {
          path: '/conf',
          name: 'conf',
          component: Conf
        },
        {
          path: '/judge-server',
          name: 'judge-server',
          component: JudgeServer
        },
        {
          path: '/prune-test-case',
          name: 'prune-test-case',
          component: PruneTestCase
        },
        {
          path: '/problems',
          name: 'problem-list',
          component: ProblemList
        },
        {
          path: '/problem/create',
          name: 'create-problem',
          component: Problem
        },
        {
          path: '/problem/edit/:problemId',
          name: 'edit-problem',
          component: Problem
        },
        {
          path: '/problem/batch_ops',
          name: 'problem_batch_ops',
          component: ProblemImportOrExport
        },
        {
          path: '/contest/create',
          name: 'create-contest',
          component: Contest
        },
        {
          path: '/contest',
          name: 'contest-list',
          component: ContestList
        },
        {
          path: '/contest/:contestId/edit',
          name: 'edit-contest',
          component: Contest
        },
        {
          path: '/contest/:contestId/announcement',
          name: 'contest-announcement',
          component: Announcement
        },
        {
          path: '/contest/:contestId/problems',
          name: 'contest-problem-list',
          component: ProblemList
        },
        {
          path: '/contest/:contestId/problem/create',
          name: 'create-contest-problem',
          component: Problem
        },
        {
          path: '/contest/:contestId/problem/:problemId/edit',
          name: 'edit-contest-problem',
          component: Problem
        },
        {
          path: '/course',
          name: 'course-list',
          component: CourseList
        },
        {
          path: '/course/:courseId/contests',
          name: 'course-contest-list',
          component: CourseContestList
        },
        {
          path: '/course/:courseId/to_add_contests',
          name: 'course-contest-toadd-list',
          component: CourseContestList
        },
        {
          path: '/course/:courseId/users_request',
          name: 'course-user-request-list',
          component: CourseUserRequestList
        },
        {
          path: '/course/:courseId/users',
          name: 'course-user-list',
          component: CourseUserList
        },
        {
          path: '/course/:courseId/to_add_users',
          name: 'course-user-toadd-list',
          component: CourseUserList
        }
      ]
    },
    {
      path: '*', redirect: '/login'
    }
  ]
})
