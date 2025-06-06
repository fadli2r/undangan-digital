import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function OrderDetailsModal({ isOpen, onClose, order }) {
  if (!order) return null;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Order Details
                </Dialog.Title>

                <div className="mt-2 space-y-4">
                  {/* Order Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Order Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Invoice ID</p>
                        <p className="font-medium">{order.invoice_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(order.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className={`font-medium ${
                          order.status === 'paid' ? 'text-green-600' :
                          order.status === 'pending' ? 'text-yellow-600' :
                          order.status === 'expired' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {order.status.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">{formatCurrency(order.harga)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{order.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Package Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Package Information</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Package Name</p>
                        <p className="font-medium">{order.paket}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Used Status</p>
                        <p className="font-medium">{order.used ? 'Used' : 'Not Used'}</p>
                      </div>
                      {order.invitation_slug && (
                        <div>
                          <p className="text-sm text-gray-500">Invitation Link</p>
                          <a 
                            href={`/${order.invitation_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Invitation
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  {order.status === 'paid' && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none"
                      onClick={() => window.open(`/invoice/${order.invoice_id}`, '_blank')}
                    >
                      View Invoice
                    </button>
                  )}
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
