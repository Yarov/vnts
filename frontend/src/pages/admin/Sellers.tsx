import  { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { Button, Card, Modal, FormField, CheckboxField } from '../../components/ui';
import { Database } from '../../types/database.types';
import { CheckCircleIcon, XCircleIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon, PlusIcon, LinkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAdminSellers } from '../../hooks/useAdminSellers';
import api from '../../services/api';

type Seller = Database['public']['Tables']['sellers']['Row'];

export default function Sellers() {
  const [user] = useAtom(userAtom);
  const [orgSlug, setOrgSlug] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
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
    branches,
    selectedBranches,
    setSelectedBranches,
    isDeleteConfirmOpen,
    confirmDeleteSeller,
    closeDeleteConfirm,
    handleDeleteSeller,
    isDeletingSeller
  } = useAdminSellers();

  // Obtener slug de la organización
  useEffect(() => {
    const fetchOrgSlug = async () => {
      if (user?.organizationId) {
        try {
          const response = await api.get(`/organizations/${user.organizationId}/`);
          if (response.data && response.data.slug) {
            setOrgSlug(response.data.slug);
          }
        } catch (error) {
          console.error('Error al obtener slug de organización:', error);
        }
      }
    };
    fetchOrgSlug();
  }, [user?.organizationId]);

  const sellerLoginUrl = orgSlug 
    ? `${window.location.origin}/${orgSlug}/seller`
    : `${window.location.origin}/seller`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sellerLoginUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {/* Banner con URL de acceso para vendedores */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <LinkIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              URL de Acceso para Vendedores
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Comparte esta URL con tus vendedores para que puedan acceder a su panel de ventas:
            </p>
            <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-300 p-3">
              <code className="flex-1 text-sm font-mono text-blue-700">
                {sellerLoginUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                icon={copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Los vendedores usarán su código numérico para iniciar sesión
            </p>
          </div>
        </div>
      </Card>

      {/* Tabla solo en desktop */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursales</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
                      </div>
                    </td>
                  </tr>
                ) : sellers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron vendedores
                    </td>
                  </tr>
                ) : (
                  sellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-lg font-semibold text-gray-800">{seller.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{seller.numeric_code}</span>
                      </td>
                      <td className="px-6 py-4">
                        {seller.assigned_branches && seller.assigned_branches.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {seller.assigned_branches.map((branch) => (
                              <span key={branch.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {branch.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Todas
                          </span>
                        )}
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
                  <div className="text-sm text-gray-500">Código: {seller.numeric_code}</div>
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveSeller();
              }}
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
            label="Código de acceso"
            name="numeric_code"
            value={currentSeller?.numeric_code || ''}
            onChange={handleInputChange}
            error={formErrors.numeric_code}
            required
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

          {/* Selector de sucursales - solo si hay múltiples */}
          {branches.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sucursales asignadas (opcional)
              </label>
              <select
                multiple
                value={selectedBranches}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedBranches(selected);
                }}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                size={Math.min(branches.length, 5)}
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Mantén presionado Ctrl/Cmd para seleccionar múltiples. Si no seleccionas ninguna, el vendedor estará disponible en todas las sucursales.
              </p>
            </div>
          )}

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
        onClose={closeDeleteConfirm}
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
