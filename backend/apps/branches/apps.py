from django.apps import AppConfig


class BranchesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.branches'
    verbose_name = 'Sucursales'
    
    def ready(self):
        """Importar signals cuando la app esté lista"""
        import apps.branches.signals  # noqa
