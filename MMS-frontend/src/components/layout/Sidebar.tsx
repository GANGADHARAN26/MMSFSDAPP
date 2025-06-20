import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  TruckIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  Cog6ToothIcon,
  UsersIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Define navigation items based on user role
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['Admin'] },
    { name: 'Assets', href: '/assets', icon: CubeIcon, roles: ['Admin', 'BaseCommander', 'LogisticsOfficer'] },
    { name: 'Transfers', href: '/transfers', icon: TruckIcon, roles: ['Admin', 'BaseCommander', 'LogisticsOfficer'] },
    { name: 'Purchases', href: '/purchases', icon: ShoppingCartIcon, roles: ['Admin', 'BaseCommander', 'LogisticsOfficer'] },
    { name: 'Assignments', href: '/assignments', icon: UserGroupIcon, roles: ['Admin', 'BaseCommander'] },
    { name: 'Expenditures', href: '/expenditures', icon: ArchiveBoxIcon, roles: ['Admin', 'BaseCommander'] },
    { name: 'Users', href: '/users', icon: UsersIcon, roles: ['Admin'] },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['Admin'] },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-military-navy-dark pt-5 pb-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex flex-shrink-0 items-center px-4">
                  <h1 className="text-xl font-bold text-white">Military Asset Management</h1>
                </div>
                <div className="mt-5 h-0 flex-1 overflow-y-auto">
                  <nav className="space-y-1 px-2">
                    {filteredNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          router.pathname === item.href
                            ? 'bg-military-navy-light text-white'
                            : 'text-gray-300 hover:bg-military-navy-light hover:text-white',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            router.pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-white',
                            'mr-4 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-military-navy-dark">
          <div className="flex h-16 flex-shrink-0 items-center bg-military-navy-dark px-4">
            <h1 className="text-xl font-bold text-white">Military Asset Management</h1>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    router.pathname === item.href
                      ? 'bg-military-navy-light text-white'
                      : 'text-gray-300 hover:bg-military-navy-light hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      router.pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-white',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;