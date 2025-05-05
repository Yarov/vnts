import  { useState } from 'react';
import { Button, Card, Modal, FormField, CheckboxField } from '../../components/ui';
import { Database } from '../../types/database.types';
import { CheckCircleIcon, XCircleIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAdminSellers } from '../../hooks/useAdminSellers';

type Seller = Database['public']['Tables']['sellers']['Row'];

export default function Sellers() {
  const {
    sellers,
    loading,
    isModalOpen,
    openSellerModal,
    closeModal,
    currentSeller,
    setCurrentSeller,
    formErrors,
    isSubmitting,
    handleInputChange,
    handleSaveSeller,
    toggleSellerStatus,
    isDeleteConfirmOpen,
    confirmDeleteSeller,
    handleDeleteSeller,
    isDeletingSeller
  } = useAdminSellers();

  const columns = [
    {
      header: 'Vendedor',
      accessor: (seller: Seller) => (
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-gray-800">{seller.name}</span>
          <span className="text-sm text-gray-500">{seller.email}</span>
        </div>
      )
    },
    {
      header: 'Teléfono',
      accessor: (seller: Seller) => (
        <span className="text-gray-600">{seller.phone || 'No especificado'}</span>
      )
    },
    {
      header: 'Comisión',
      accessor: (seller: Seller) => (
        <span className="text-gray-800 font-medium">{seller.commission_percentage}%</span>
      )
    },
    {
      header: 'Estado',
      accessor: (seller: Seller) => (
        <span className={`flex items-center ${seller.active ? 'text-primary-600' : 'text-gray-500'}`}>
          {seller.active ? (
            <><CheckCircleIcon className="h-5 w-5 mr-1" /> Activo</>
          ) : (
            <><XCircleIcon className="h-5 w-5 mr-1" /> Inactivo</>
          )}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessor: (seller: Seller) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSellerStatus(seller.id, seller.active)}
            icon={seller.active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
            className={seller.active ? "text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200" : ""}
          >
            {seller.active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSellerModal(seller)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => confirmDeleteSeller(seller.id)}
            icon={<TrashIcon className="h-4 w-4" />}
            className="text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200"
          >
            Eliminar
          </Button>
        </div>
      ),
      className: 'text-right'
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-gray-800">Gestión de Vendedores</h2>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => openSellerModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Vendedor
          </Button>
        </div>
      </div>

      {/* Tabla solo en desktop */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
                      </div>
                    </td>
                  </tr>
                ) : sellers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron vendedores
                    </td>
                  </tr>
                ) : (
                  sellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-lg font-semibold text-gray-800">{seller.name}</span>
                          <span className="text-sm text-gray-500">{seller.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{seller.phone || 'No especificado'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-800 font-medium">{seller.commission_percentage}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`flex items-center justify-center ${seller.active ? 'text-primary-600' : 'text-gray-500'}`}>
                          {seller.active ? (
                            <><CheckCircleIcon className="h-5 w-5 mr-1" /> Activo</>
                          ) : (
                            <><XCircleIcon className="h-5 w-5 mr-1" /> Inactivo</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSellerStatus(seller.id, seller.active)}
                            icon={seller.active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                            className={seller.active ? "text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200" : ""}
                          >
                            {seller.active ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSellerModal(seller)}
                            icon={<PencilIcon className="h-4 w-4" />}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDeleteSeller(seller.id)}
                            icon={<TrashIcon className="h-4 w-4" />}
                            className="text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cards en mobile */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
          </div>
        ) : sellers.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">No se encontraron vendedores</div>
          </Card>
        ) : (
          sellers.map((seller) => (
            <Card key={seller.id} className="relative p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-lg text-gray-800">{seller.name}</div>
                  <div className="text-sm text-gray-500">{seller.email}</div>
                  <div className="text-sm text-gray-600 mt-1">{seller.phone || 'No especificado'}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-sm font-medium text-gray-800">
                      Comisión: {seller.commission_percentage}%
                    </div>
                    <div className={`flex items-center text-sm ${seller.active ? 'text-primary-600' : 'text-gray-500'}`}>
                      {seller.active ? (
                        <><CheckCircleIcon className="h-4 w-4 mr-1" /> Activo</>
                      ) : (
                        <><XCircleIcon className="h-4 w-4 mr-1" /> Inactivo</>
                      )}
                    </div>
                  </div>
                </div>
                {/* Menú de acciones */}
                <MobileSellerActions
                  seller={seller}
                  onEdit={() => openSellerModal(seller)}
                  onDelete={() => confirmDeleteSeller(seller.id)}
                  onToggleStatus={() => toggleSellerStatus(seller.id, seller.active)}
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de creación/edición de vendedor */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentSeller?.id ? 'Editar Vendedor' : 'Crear Nuevo Vendedor'}
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveSeller}
              isLoading={isSubmitting}
            >
              {currentSeller?.id ? 'Guardar cambios' : 'Crear vendedor'}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveSeller(e); }}>
          <FormField
            label="Nombre del vendedor"
            name="name"
            value={currentSeller?.name || ''}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={currentSeller?.email || ''}
            onChange={handleInputChange}
            error={formErrors.email}
            required
          />
          <FormField
            label="Teléfono"
            name="phone"
            value={currentSeller?.phone || ''}
            onChange={handleInputChange}
            error={formErrors.phone}
          />
          <FormField
            label="Porcentaje de comisión"
            name="commission_percentage"
            type="number"
            min="0"
            max="100"
            value={currentSeller?.commission_percentage || ''}
            onChange={handleInputChange}
            error={formErrors.commission_percentage}
            required
          />
          <CheckboxField
            label="Vendedor activo"
            name="active"
            checked={currentSeller?.active || false}
            onChange={(e) => {
              if (currentSeller) {
                setCurrentSeller({
                  ...currentSeller,
                  active: e.target.checked
                });
              }
            }}
          />
        </form>
      </Modal>

      {/* Diálogo de confirmación para eliminar vendedor */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeModal}
        onConfirm={handleDeleteSeller}
        title="Eliminar Vendedor"
        message="¿Estás seguro de que deseas eliminar este vendedor? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeletingSeller}
      />
    </div>
  );
}

// Componente de acciones mobile
function MobileSellerActions({ seller, onEdit, onDelete, onToggleStatus }: {
  seller: Seller;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Acciones"
      >
        <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            <PencilIcon className="h-4 w-4 mr-2" /> Editar
          </button>
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => { setOpen(false); onToggleStatus(); }}
          >
            {seller.active ? <XCircleIcon className="h-4 w-4 mr-2" /> : <CheckCircleIcon className="h-4 w-4 mr-2" />}
            {seller.active ? 'Desactivar' : 'Activar'}
          </button>
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-primary-600 hover:bg-primary-50"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <TrashIcon className="h-4 w-4 mr-2" /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
